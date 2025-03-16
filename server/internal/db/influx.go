package db

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/bluesky-social/indigo/api/atproto"
	influxdb "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
)

type Influx struct {
	notification api.WriteAPI
	firehose     api.WriteAPI
	client       influxdb.Client
}

func LoadInflux() (*Influx, error) {
	token := os.Getenv("INFLUXDB_ADMIN_TOKEN")

	if token == "" {
		return nil, nil
	}

	influxClient := influxdb.NewClient("http://influx:8086", token)

	notificationApi := influxClient.WriteAPI("skynotify", "notification")

	notificationErrors := notificationApi.Errors()
	go func() {
		for err := range notificationErrors {
			slog.Error("InfluxDB Notifications", "error", err)
		}
	}()

	organizations := influxClient.OrganizationsAPI()
	org, err := organizations.FindOrganizationByName(context.Background(), "skynotify")
	if err != nil {
		return nil, fmt.Errorf("loadInflux: %w", err)
	}

	buckets := influxClient.BucketsAPI()
	_, err = buckets.FindBucketByName(context.Background(), "firehose")
	if err != nil {
		if err.Error() != "bucket 'firehose' not found" {
			return nil, fmt.Errorf("loadInflux: %w", err)
		}

		_, err = buckets.CreateBucketWithName(context.Background(), org, "firehose")
		if err != nil {
			return nil, fmt.Errorf("loadInflux: %w", err)
		}
	}

	firehoseApi := influxClient.WriteAPI("skynotify", "firehose")

	firehoseErrors := firehoseApi.Errors()
	go func() {
		for err := range firehoseErrors {
			slog.Error("InfluxDB Firehose", "error", err)
		}
	}()

	_, err = buckets.FindBucketByName(context.Background(), "firehose-downsampled")
	if err != nil {
		if err.Error() != "bucket 'firehose-downsampled' not found" {
			return nil, fmt.Errorf("loadInflux: %w", err)
		}

		_, err = buckets.CreateBucketWithName(context.Background(), org, "firehose-downsampled")
		if err != nil {
			return nil, fmt.Errorf("loadInflux: %w", err)
		}
	}

	tasksApi := influxClient.TasksAPI()
	tasks, err := tasksApi.FindTasks(context.Background(), &api.TaskFilter{Name: "firehose-downsample"})
	if err != nil {
		return nil, fmt.Errorf("loadInflux: %w", err)
	}

	for _, task := range tasks {
		if task.Name == "firehose-downsample" {
			return nil, nil
		}
	}

	_, err = tasksApi.CreateTaskWithEvery(context.Background(), "firehose-downsample", `from(bucket: "firehose")
  |> range(start: -task.every)
  |> filter(fn: (r) => r._measurement == "commit" and r._field == "ops")
  |> aggregateWindow(every: 1s, fn: sum)
  |> to(bucket: "firehose-downsampled")`, "1m", *org.Id)

	if err != nil {
		return nil, fmt.Errorf("loadInflux: %w", err)
	}

	return &Influx{notification: notificationApi, firehose: firehoseApi, client: influxClient}, nil
}

func (i *Influx) Close() {
	if i == nil || i.client == nil {
		return
	}

	i.client.Close()
}

func (i *Influx) GetLastSeq() (int64, error) {
	if i == nil {
		return 0, nil
	}

	q := i.client.QueryAPI("skynotify")
	// range could be up to 3d, but is very slow and would be very spammy
	res, err := q.Query(context.Background(), `from(bucket: "firehose")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "commit")
  |> filter(fn: (r) => r._field == "seq")
  |> sort(columns: ["_value"])
  |> last()`)
	if err != nil {
		return 0, fmt.Errorf("getLastSeq: %w", err)
	}

	if !res.Next() {
		return 0, nil
	}

	val := res.Record().Value()
	if val == nil {
		return 0, nil
	}

	seq, ok := val.(int64)
	if !ok {
		return 0, fmt.Errorf("getLastSeq: couldn't read seq field as int64")
	}

	return seq, nil
}

func (i *Influx) WriteNotificationPoint(notificationType string, success bool, value int) {
	if i == nil || i.notification == nil {
		return
	}

	i.notification.WritePoint(write.NewPoint("sent", map[string]string{
		"type":    notificationType,
		"success": strconv.FormatBool(success),
	}, map[string]interface{}{
		"value": value,
	}, time.Now()))
}

func (i *Influx) WriteCommitPoint(evt *atproto.SyncSubscribeRepos_Commit) error {
	if i == nil || i.firehose == nil {
		return nil
	}

	t, err := time.Parse(time.RFC3339, evt.Time)
	if err != nil {
		return fmt.Errorf("writeCommitPoint: %w", err)
	}

	p := write.NewPoint("commit", map[string]string{
		"tooBig": strconv.FormatBool(evt.TooBig),
	}, map[string]interface{}{
		"value": 1,
		"seq":   evt.Seq,
	}, t)
	if evt.Ops != nil {
		p.AddField("ops", len(evt.Ops))
	}

	i.firehose.WritePoint(p)

	return nil
}

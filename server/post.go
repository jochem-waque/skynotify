/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package main

import (
	"bytes"
	"context"

	"github.com/ipld/go-car/v2/storage"
	"github.com/ipld/go-ipld-prime/codec/dagcbor"
	"github.com/ipld/go-ipld-prime/datamodel"
	"github.com/ipld/go-ipld-prime/node/basicnode"
)

type postData struct {
	text      string
	imageRef  string
	reply     bool
	createdAt string
}

func getPostData(car storage.ReadableCar, cid string) (postData, error) {
	data := postData{}

	blk, err := car.Get(context.Background(), cid)
	if err != nil {
		return data, err
	}

	reader := bytes.NewReader(blk)

	nb := basicnode.Prototype.Any.NewBuilder()
	err = dagcbor.Decode(nb, reader)
	if err != nil {
		return data, err
	}

	n := nb.Build()
	text, err := extractText(n)
	if err != nil {
		return data, err
	}

	data.text = text
	data.reply = isReply(n)

	imageRef, err := extractImage(n)
	if err != nil {
		return data, err
	}

	data.imageRef = imageRef

	createdAt, err := extractCreatedAt(n)
	if err != nil {
		return data, err
	}

	data.createdAt = createdAt

	return data, nil
}

func extractText(node datamodel.Node) (string, error) {
	text, err := node.LookupByString("text")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", err
	}

	textstr, err := text.AsString()
	if err != nil {
		return "", err
	}

	return textstr, nil
}

func extractCreatedAt(node datamodel.Node) (string, error) {
	createdAt, err := node.LookupByString("createdAt")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", err
	}

	createdAtStr, err := createdAt.AsString()
	if err != nil {
		return "", err
	}

	return createdAtStr, nil
}

func isReply(node datamodel.Node) bool {
	// TODO: figure out how to check if it's ErrNotExists
	_, err := node.LookupByString("reply")
	return err == nil
}

func extractImage(node datamodel.Node) (string, error) {
	embed, err := node.LookupByString("embed")
	// TODO: figure out how to check if it's ErrNotExists
	if err != nil {
		return "", nil
	}

	images, err := embed.LookupByString("images")
	// TODO: figure out how to check if it's ErrNotExists
	// TODO: support other embed types
	if err != nil {
		return "", nil
	}

	it := images.ListIterator()
	if it == nil {
		return "", datamodel.ErrWrongKind{
			TypeName:        "",
			MethodName:      "ListIterator",
			AppropriateKind: datamodel.KindSet{datamodel.Kind_List},
			ActualKind:      images.Kind(),
		}
	}

	_, entry, err := it.Next()
	if err != nil {
		return "", err
	}

	image, err := entry.LookupByString("image")
	if err != nil {
		return "", err
	}

	ref, err := image.LookupByString("ref")
	if err != nil {
		return "", err
	}

	linkNode, err := ref.AsLink()
	if err != nil {
		return "", err
	}

	return linkNode.String(), nil
}

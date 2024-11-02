-- name: GetSubscriptions :many
SELECT token, posts, reposts, replies FROM subscription WHERE target = pggen.arg('did');

-- name: DeleteToken :exec
DELETE FROM subscription WHERE token = pggen.arg('token');

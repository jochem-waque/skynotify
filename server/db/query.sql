-- name: GetSubscriptions :many
SELECT token.token, posts, reposts, replies FROM subscription INNER JOIN token ON token.id = subscription.token WHERE target = pggen.arg('did') AND unregistered IS NULL;

-- name: InvalidateToken :exec
UPDATE token SET unregistered = NOW() WHERE token = pggen.arg('token');

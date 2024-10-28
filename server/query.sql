-- name: GetSubscriptions :many
SELECT account.token, subscription.posts, subscription.reposts, subscription.replies FROM subscription INNER JOIN account ON subscription.account = account.id WHERE account.token IS NOT NULL AND subscription.target = pggen.arg('did');

-- name: ClearToken :exec
UPDATE account SET token = NULL where id = pggen.arg('id');

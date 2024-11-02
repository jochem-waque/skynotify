CREATE TABLE subscription (
    token text NOT NULL,
    target text NOT NULL,
    posts boolean NOT NULL,
    reposts boolean NOT NULL,
    replies boolean NOT NULL
);


ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_account_target_pk PRIMARY KEY (token, target);

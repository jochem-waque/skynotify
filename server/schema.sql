CREATE TABLE account (
    id text NOT NULL,
    name text NOT NULL,
    token text
);

CREATE TABLE subscription (
    account text NOT NULL,
    target text NOT NULL,
    posts boolean NOT NULL,
    reposts boolean NOT NULL,
    replies boolean NOT NULL
);

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_account_target_pk PRIMARY KEY (account, target);

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_account_account_id_fk FOREIGN KEY (account) REFERENCES public.account(id);

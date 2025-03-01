--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: sdf; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA sdf;


ALTER SCHEMA sdf OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO neondb_owner;

--
-- Name: Approval; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Approval" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "iidNumber" text NOT NULL,
    "confirmationNumber" text NOT NULL
);


ALTER TABLE public."Approval" OWNER TO neondb_owner;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "maxUses" integer NOT NULL,
    "minAmount" integer DEFAULT 0 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    value integer NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO neondb_owner;

--
-- Name: CouponUsage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CouponUsage" (
    id text NOT NULL,
    "couponId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "creditAmount" integer NOT NULL
);


ALTER TABLE public."CouponUsage" OWNER TO neondb_owner;

--
-- Name: CreditPackage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CreditPackage" (
    id text NOT NULL,
    name text NOT NULL,
    credits integer NOT NULL,
    price double precision NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentMethodId" text NOT NULL
);


ALTER TABLE public."CreditPackage" OWNER TO neondb_owner;

--
-- Name: CreditTransaction; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."CreditTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL,
    "couponId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    note text
);


ALTER TABLE public."CreditTransaction" OWNER TO neondb_owner;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "totalPrice" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentMethodId" text
);


ALTER TABLE public."Order" OWNER TO neondb_owner;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    "licenseKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO neondb_owner;

--
-- Name: PageContent; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PageContent" (
    id text NOT NULL,
    "pageKey" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "metaTitle" text,
    "metaDesc" text,
    content jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PageContent" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PaymentMethod" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    provider text DEFAULT 'OTHER'::text NOT NULL,
    type text DEFAULT 'EXTERNAL'::text NOT NULL
);


ALTER TABLE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    "imageUrl" text,
    stock integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO neondb_owner;

--
-- Name: ProductCategory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ProductCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductCategory" OWNER TO neondb_owner;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO neondb_owner;

--
-- Name: SupportCategory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."SupportCategory" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportCategory" OWNER TO neondb_owner;

--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Ticket" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "categoryId" text NOT NULL,
    subject text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "closedAt" timestamp(3) without time zone,
    priority text DEFAULT 'normal'::text NOT NULL
);


ALTER TABLE public."Ticket" OWNER TO neondb_owner;

--
-- Name: TicketMessage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."TicketMessage" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isStaff" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."TicketMessage" OWNER TO neondb_owner;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    status text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Approval; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Approval" (id, "userId", status, "createdAt", "updatedAt", "iidNumber", "confirmationNumber") FROM stdin;
cm7nc32be0003kwpj7ebkzjj7	cm7n9tmc70000kwuqwa5idkpp	success	2025-02-27 12:41:46.874	2025-02-27 12:41:46.874	562464621711828429350195129473255608242800904318121455843170722	505922-286394-042244-836513-312011-918790-077620-682922
cm7nhgv6v0001lc031m0myw96	cm7n9tmc70000kwuqwa5idkpp	success	2025-02-27 15:12:28.903	2025-02-27 15:12:28.903	044653034821852892145157860556819257608996723990641131707772324	212444-654776-902245-424870-205215-927834-314830-398435
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Coupon" (id, code, "expiresAt", "createdAt", "updatedAt", "isActive", "maxUses", "minAmount", "usedCount", value) FROM stdin;
\.


--
-- Data for Name: CouponUsage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CouponUsage" (id, "couponId", "userId", "createdAt", "updatedAt", "creditAmount") FROM stdin;
\.


--
-- Data for Name: CreditPackage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CreditPackage" (id, name, credits, price, "isActive", "createdAt", "updatedAt", "paymentMethodId") FROM stdin;
default-başlangıç-paketi	Başlangıç Paketi	100	49.99	t	2025-02-27 11:30:50.192	2025-02-27 11:30:50.192	default
default-standart-paket	Standart Paket	500	199.99	t	2025-02-27 11:30:50.552	2025-02-27 11:30:50.552	default
default-premium-paket	Premium Paket	1000	349.99	t	2025-02-27 11:30:50.772	2025-02-27 11:30:50.772	default
\.


--
-- Data for Name: CreditTransaction; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."CreditTransaction" (id, "userId", type, amount, "couponId", "createdAt", "updatedAt", note) FROM stdin;
cm7nc2gad0001kwpjncn0we7z	cm7n9tmc70000kwuqwa5idkpp	deposit	100	\N	2025-02-27 12:41:18.325	2025-02-27 12:41:18.325	\N
cm7nc32dv0005kwpjmsmcydd5	cm7n9tmc70000kwuqwa5idkpp	usage	-1	\N	2025-02-27 12:41:46.964	2025-02-27 12:41:46.964	\N
cm7ncx4b70007kwjy1c6b4r47	cm7n9tmc70000kwuqwa5idkpp	deposit	100	\N	2025-02-27 13:05:09.14	2025-02-27 13:05:09.14	\N
cm7ncxcvs0009kwjyhe94lbby	cm7n9tmc70000kwuqwa5idkpp	PURCHASE	-129	\N	2025-02-27 13:05:20.248	2025-02-27 13:05:20.248	Sipariş: cm7ncwj8j0003kwjyr16geub7 - Mağaza alışverişi
cm7nhgv880003lc03ouw1spuy	cm7n9tmc70000kwuqwa5idkpp	usage	-1	\N	2025-02-27 15:12:28.953	2025-02-27 15:12:28.953	\N
cm7nhj3wl0001l80319jmyw57	cm7n9tmc70000kwuqwa5idkpp	deposit	100	\N	2025-02-27 15:14:13.509	2025-02-27 15:14:13.509	\N
cm7nhk1ti0001l403ss8e7v24	cm7n9tmc70000kwuqwa5idkpp	PURCHASE	-129	\N	2025-02-27 15:14:57.462	2025-02-27 15:14:57.462	Sipariş: cm7nepbk20001la03tp4hio93 - Mağaza alışverişi
cm7nhlx3m0003l403xap3wg2a	cm7n9tmc70000kwuqwa5idkpp	deposit	100	\N	2025-02-27 15:16:24.658	2025-02-27 15:16:24.658	\N
cm7nhmwuk0009lc03trumk8ya	cm7n9tmc70000kwuqwa5idkpp	PURCHASE	-129	\N	2025-02-27 15:17:10.988	2025-02-27 15:17:10.988	Sipariş: cm7nhml2w0005lc0393lkfprs - Mağaza alışverişi
cm7nqddqa0001i90390bhub0h	cm7n9tmc70000kwuqwa5idkpp	deposit	500	\N	2025-02-27 19:21:42.85	2025-02-27 19:21:42.85	\N
cm7nqdq3i0001ie035qpmft9y	cm7n9tmc70000kwuqwa5idkpp	PURCHASE	-129	\N	2025-02-27 19:21:58.879	2025-02-27 19:21:58.879	Sipariş: cm7nqdl270001jr03xvpbg9vi - Mağaza alışverişi
cm7o0my590002js0ly39re4ho	cm7n9tmc70000kwuqwa5idkpp	deposit	100	\N	2025-02-28 00:09:05.374	2025-02-28 00:09:05.374	\N
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Order" (id, "userId", status, "totalPrice", "createdAt", "updatedAt", "paymentMethodId") FROM stdin;
cm7ncwj8j0003kwjyr16geub7	cm7n9tmc70000kwuqwa5idkpp	completed	129.9	2025-02-27 13:04:41.827	2025-02-27 13:05:20.437	\N
cm7nepbk20001la03tp4hio93	cm7n9tmc70000kwuqwa5idkpp	completed	129.9	2025-02-27 13:55:04.514	2025-02-27 15:14:57.47	\N
cm7nhlgrv0003l8038imx9hwe	cm7n9tmc70000kwuqwa5idkpp	processing	129.9	2025-02-27 15:16:03.499	2025-02-27 15:16:16.693	default
cm7nhml2w0005lc0393lkfprs	cm7n9tmc70000kwuqwa5idkpp	completed	129.9	2025-02-27 15:16:55.737	2025-02-27 15:17:10.996	\N
cm7nqdl270001jr03xvpbg9vi	cm7n9tmc70000kwuqwa5idkpp	completed	129.9	2025-02-27 19:21:52.352	2025-02-27 19:21:58.889	\N
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, "licenseKey", "createdAt", "updatedAt") FROM stdin;
cm7ncwj8k0005kwjy6vmwqe19	cm7ncwj8j0003kwjyr16geub7	cm7ncw5eq0001kwjyb7kk5efa	1	129.9	\N	2025-02-27 13:04:41.827	2025-02-27 13:04:41.827
cm7nepbk20003la03bwiywbn7	cm7nepbk20001la03tp4hio93	cm7ncw5eq0001kwjyb7kk5efa	1	129.9	\N	2025-02-27 13:55:04.514	2025-02-27 15:14:00.268
cm7nhlgrv0005l803xgdkevme	cm7nhlgrv0003l8038imx9hwe	cm7ncw5eq0001kwjyb7kk5efa	1	129.9	\N	2025-02-27 15:16:03.499	2025-02-27 15:16:03.499
cm7nhml2w0007lc03jad0vae6	cm7nhml2w0005lc0393lkfprs	cm7ncw5eq0001kwjyb7kk5efa	1	129.9	\N	2025-02-27 15:16:55.737	2025-02-27 15:16:55.737
cm7nqdl270003jr03jdkp48fs	cm7nqdl270001jr03xvpbg9vi	cm7ncw5eq0001kwjyb7kk5efa	1	129.9	\N	2025-02-27 19:21:52.352	2025-02-27 19:21:52.352
\.


--
-- Data for Name: PageContent; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PageContent" (id, "pageKey", title, description, "metaTitle", "metaDesc", content, "isActive", "createdAt", "updatedAt") FROM stdin;
cm7nbez8l0001kw9qwpzwwest	account-orders	Siparişlerim	Kullanıcı siparişleri sayfası	Siparişlerim - Microsoft Onay Sistemi	Microsoft Onay Sistemi siparişlerinizi görüntüleyin ve takip edin.	{"hero": {"title": "Siparişlerim", "imageUrl": "/images/orders-hero.jpg", "description": "Tüm siparişlerinizi görüntüleyin ve takip edin"}, "features": [{"icon": "eye", "title": "Sipariş Takibi", "description": "Siparişlerinizi anlık olarak takip edin"}, {"icon": "clock", "title": "Sipariş Geçmişi", "description": "Tüm sipariş geçmişinize erişin"}, {"icon": "file-text", "title": "Fatura İndirme", "description": "Faturalarınızı kolayca indirin"}], "orderStatus": {"title": "Sipariş Durumu", "statuses": [{"label": "Beklemede", "status": "pending", "description": "Siparişiniz işleme alındı, ödeme bekleniyor"}, {"label": "İşleniyor", "status": "processing", "description": "Siparişiniz işleniyor"}, {"label": "Tamamlandı", "status": "completed", "description": "Siparişiniz tamamlandı"}, {"label": "İptal Edildi", "status": "cancelled", "description": "Siparişiniz iptal edildi"}]}}	t	2025-02-27 12:23:03.142	2025-02-27 12:33:01.333
cm7nbezb50002kw9q02at2yvg	login	Giriş Yap	Kullanıcı giriş sayfası	Giriş Yap - Microsoft Onay Sistemi	Microsoft Onay Sistemi'ne giriş yapın ve hizmetlerimizden yararlanın.	{"hero": {"title": "Hesabınıza Giriş Yapın", "imageUrl": "/images/login-hero.jpg", "description": "Microsoft Onay Sistemi'ne hoş geldiniz"}, "features": [{"icon": "lock", "title": "Güvenli Giriş", "description": "SSL korumalı güvenli giriş"}, {"icon": "zap", "title": "Hızlı Erişim", "description": "Hesabınıza hızlı erişim sağlayın"}, {"icon": "key", "title": "Şifremi Unuttum", "description": "Şifrenizi kolayca sıfırlayın"}]}	t	2025-02-27 12:23:03.234	2025-02-27 12:33:01.421
cm7nayg4y0000kwl5pee6cjti	cart	Sepetim	Sepetim	Sepetim	Sepetim	{}	t	2025-02-27 12:10:11.89	2025-02-27 12:10:11.89
cm7nam5xr0000kw01ow1zdp12	store	Mağaza	Microsoft Onay Sistemi mağaza sayfası	Mağazaa - Microsoft Onay Sistemi	Microsoft Onay Sistemi mağazasında ürünlerimizi keşfedin ve hemen satın alın.	{"hero": {"title": "Ürün Mağazamızz", "imageUrl": "/images/store-hero.jpg", "buttonText": "Ürünleri Keşfet", "description": "Microsoft ürünleri ve onay hizmetlerimizi keşfedin"}, "features": [{"icon": "send", "title": "Hızlı Teslimat", "description": "Anında e-posta ile teslimat"}, {"icon": "lock", "title": "Güvenli Ödeme", "description": "128-bit SSL şifrelemeli güvenli ödeme"}, {"icon": "headphones", "title": "7/24 Destek", "description": "Satış öncesi ve sonrası destek"}], "categories": {"items": [{"icon": "file-text", "title": "Office Ürünleri", "description": "Microsoft Office ürünleri için onay hizmetleri"}, {"icon": "monitor", "title": "Windows", "description": "Windows işletim sistemleri için onay hizmetleri"}, {"icon": "server", "title": "Sunucu Ürünleri", "description": "Microsoft Server ürünleri için onay hizmetleri"}], "title": "Ürün Kategorileri", "description": "İhtiyacınıza uygun ürünleri bulun"}}	t	2025-02-27 12:00:38.8	2025-02-27 13:13:54.638
cm7nbez4r0000kw9q0vftbbki	dashboard	Kontrol Paneli	Kullanıcı kontrol paneli sayfası	Kontrol Paneli - Microsoft Onay Sistemi	Microsoft Onay Sistemi kullanıcı kontrol paneli. Kredi bakiyenizi görüntüleyin ve onay işlemlerinizi takip edin.	{"hero": {"title": "Kontrol Paneli", "imageUrl": "/images/dashboard-hero.jpg", "description": "Hoş geldiniz! Kredi bakiyenizi görüntüleyin ve onay işlemlerinizi takip edin."}, "features": [{"icon": "zap", "title": "Hızlı Onay", "description": "Saniyeler içinde onay numaranızı alın"}, {"icon": "shield", "title": "Güvenli İşlem", "description": "Tüm işlemleriniz güvenle saklanır"}, {"icon": "headphones", "title": "7/24 Destek", "description": "Teknik ekibimiz her zaman yanınızda"}], "quickStats": [{"icon": "credit-card", "title": "Kredi Bakiyesi"}, {"icon": "check-circle", "title": "Toplam Onay"}, {"icon": "clock", "title": "Son İşlem"}]}	t	2025-02-27 12:23:03.003	2025-02-27 12:33:01.244
cm7nbezdo0003kw9qzn2qib23	register	Kayıt Ol	Kullanıcı kayıt sayfası	Kayıt Ol - Microsoft Onay Sistemi	Microsoft Onay Sistemi'ne kayıt olun ve hizmetlerimizden yararlanın.	{"hero": {"title": "Hemen Kayıt Olun", "imageUrl": "/images/register-hero.jpg", "description": "Microsoft Onay Sistemi'ne üye olarak avantajlardan yararlanın"}, "features": [{"icon": "user-plus", "title": "Hızlı Kayıt", "description": "Birkaç adımda hesabınızı oluşturun"}, {"icon": "shield", "title": "Güvenli Hesap", "description": "Güvenli ve korumalı hesap"}, {"icon": "gift", "title": "Özel Teklifler", "description": "Üyelere özel kampanya ve indirimler"}]}	t	2025-02-27 12:23:03.325	2025-02-27 12:33:01.507
cm7namvi60001kw019gyzrgom	home	Ana Sayfa	Microsoft Onay Sistemi ana sayfası	Microsoft Onay Sistemi - Hızlı ve Güvenli Onay Alın	Microsoft ürünleriniz için hızlı ve güvenli onay alın. 7/24 destek ve uygun fiyatlar.	{"cta": {"title": "Hemen Başlayın", "buttonUrl": "/onay", "buttonText": "Onay Al", "description": "Microsoft ürünleriniz için hızlı ve güvenli onay alın"}, "hero": {"title": "Microsoft Onay Sistemi", "imageUrl": "/images/hero-bg.jpg", "buttonText": "Hemen Başla", "description": "Hızlı ve güvenli bir şekilde Microsoft ürünleriniz için onay alın"}, "stats": [{"label": "Mutlu Müşteri", "value": "50,000+"}, {"label": "Başarı Oranı", "value": "99.9%"}, {"label": "Müşteri Desteği", "value": "24/7"}], "features": [{"icon": "zap", "title": "Hızlı İşlem", "description": "Saniyeler içinde onay numaranızı alın"}, {"icon": "shield", "title": "Güvenli Ödeme", "description": "SSL korumalı güvenli ödeme altyapısı"}, {"icon": "headphones", "title": "7/24 Destek", "description": "Teknik ekibimiz her zaman yanınızda"}], "testimonials": [{"name": "Ahmet Yılmaz", "role": "Yazılım Geliştirici", "avatar": "/images/testimonials/avatar1.jpg", "content": "Çok hızlı ve sorunsuz bir şekilde onay alabildim. Kesinlikle tavsiye ederim."}, {"name": "Ayşe Demir", "role": "Grafik Tasarımcı", "avatar": "/images/testimonials/avatar2.jpg", "content": "Profesyonel hizmet ve uygun fiyatlar. Teşekkürler!"}]}	t	2025-02-27 12:01:11.934	2025-02-27 12:33:01.026
cm7nbezgd0004kw9qiumosaax	ornek-sayfa	Örnek Sayfa	Sayfa içeriği kullanımı için örnek sayfa	Örnek Sayfa - Microsoft Onay Sistemi	Bu bir örnek sayfadır. Sayfa içeriği yönetim sistemini test etmek için kullanılabilir.	{"hero": {"title": "Örnek Sayfa", "imageUrl": "/images/example-hero.jpg", "buttonText": "Daha Fazla Bilgi", "description": "Bu bir örnek sayfadır"}, "features": [{"icon": "star", "title": "Özellik 1", "description": "Örnek özellik açıklaması"}, {"icon": "heart", "title": "Özellik 2", "description": "Örnek özellik açıklaması"}, {"icon": "thumbs-up", "title": "Özellik 3", "description": "Örnek özellik açıklaması"}]}	t	2025-02-27 12:23:03.421	2025-02-27 12:33:01.593
\.


--
-- Data for Name: PaymentMethod; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PaymentMethod" (id, name, description, "isActive", "createdAt", "updatedAt", provider, type) FROM stdin;
default	Kredi Kartı	Varsayılan ödeme yöntemi	t	2025-02-27 11:30:49.791	2025-02-27 11:30:49.791	OTHER	EXTERNAL
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Product" (id, name, description, price, "imageUrl", stock, "isActive", "categoryId", "createdAt", "updatedAt") FROM stdin;
cm7ncw5eq0001kwjyb7kk5efa	Windows 11 Pro Key	sdffsdfsdfs	129.9	/uploads/27a339a1-76cc-4182-8d25-cfb19ccd9b33.png	0	t	cm7nbla3o0000kwgr4iqlfs77	2025-02-27 13:04:23.905	2025-02-27 21:10:19.564
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ProductCategory" (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
cm7nbla3o0000kwgr4iqlfs77	Windows	Windows açıklama	t	2025-02-27 12:27:57.157	2025-02-27 12:27:57.157
cm7nu74510000js0l2524np4s	Officea	sdasdsadasd	t	2025-02-27 21:08:48.95	2025-02-27 21:08:48.95
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: SupportCategory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."SupportCategory" (id, name, description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Ticket" (id, "userId", "categoryId", subject, status, "createdAt", "updatedAt", "closedAt", priority) FROM stdin;
\.


--
-- Data for Name: TicketMessage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."TicketMessage" (id, "ticketId", "userId", message, "createdAt", "updatedAt", "isStaff") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Transaction" (id, "userId", amount, type, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, "emailVerified", image, password, credits, role, "createdAt", "updatedAt", "isAdmin") FROM stdin;
cm7n9jt9c0000kwfypd2thaqe	Admin	admin@example.com	\N	\N	$2a$12$jL4ut0PZ.aNrrzCYfnpg.eBoS/LQsVxZNhqNLJR0YuUNu0vhm/5B2	0	admin	2025-02-27 11:30:49.44	2025-02-27 11:30:49.44	t
cm7n9tmc70000kwuqwa5idkpp	ertan taskin	ertantaskinpp@gmail.com	\N	\N	$2a$12$Ea7ubgf3nLtSP3zsIUfIe.8jKiUEntZSJvTmw.9Kncd5WKB/Zd1Dm	482	admin	2025-02-27 11:38:27.031	2025-02-28 00:09:05.396	t
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
73899f74-13fc-4342-a217-7e2e9ed8fe20	21e2b436ac3cc964ed222ff5d1aae468895cb1e4da2f72b6f11a8b5cd57e84d5	2025-02-27 11:30:38.14317+00	20250211225430_init	\N	\N	2025-02-27 11:30:37.875729+00	1
058c78eb-d828-4003-891e-7eca63358643	3bc1989b1f166df776a84307bfda457563322535b1e0565ab07093a2f833e9db	2025-02-27 11:30:38.45219+00	20250211225942_add_credit_transactions	\N	\N	2025-02-27 11:30:38.231959+00	1
de5ce737-4100-4178-a964-17233323802e	78d45080f44a5a888895f4c797dcced8cd5b72ee3f9880665395ed8f39b59d4a	2025-02-27 11:30:38.759561+00	20250211232732_add_coupon_model	\N	\N	2025-02-27 11:30:38.540301+00	1
b3fdd749-4e0f-47aa-a7c5-73f1e6479119	dd714393b37ae4302ef6f401fb6065adc9ac803465bd12f7ade6ae7e254c18c9	2025-02-27 11:30:39.071195+00	20250211233042_add_coupon_usage	\N	\N	2025-02-27 11:30:38.846062+00	1
83db6969-0a80-4385-a810-9d7e2b50b363	5671848c5aa358ea2ca6baa0cb35e88b7c42dbe3dd566abde9f2dae7621513d1	2025-02-27 11:30:39.467529+00	20250211235856_add_confirmation_number	\N	\N	2025-02-27 11:30:39.160017+00	1
7f094636-1d88-4ab7-a654-de92819a38fb	e06323727c3965980028f638dc87553ff266685fffd873ca19fd083a31134420	2025-02-27 11:30:39.774316+00	20250212001859_update_approval_model	\N	\N	2025-02-27 11:30:39.555165+00	1
ac7aad48-42cd-4b0c-9c17-6351ef66fccc	c6d78fb1cc5d898f5ccd5475c1dd1d09c968f439a7d6ebd1cc3204dd1f0b21e6	2025-02-27 11:30:40.097391+00	20250213151033_add_support_system	\N	\N	2025-02-27 11:30:39.862363+00	1
3d9818c6-7da1-4c15-b2a3-8c05f04f0145	4928d8bfee6570e687748ae8ecdede2b598625333f2d90e306d62405b46e9f6a	2025-02-27 11:30:40.415216+00	20250214002559_add_missing_columns	\N	\N	2025-02-27 11:30:40.185357+00	1
7d987684-3e70-4e93-890c-b9f08e173d90	6fdc7e6c6fe9effbcef95829a6a98e4172fa962a8845a5913ad439fdc2c1a4d1	2025-02-27 11:30:40.719644+00	20250214002728_	\N	\N	2025-02-27 11:30:40.503204+00	1
031c03c9-513d-44ae-b977-0ef0932feaf0	840243ca192534a8955222ce5f072a161d11d09c40ef9acfdea07d59d63754b9	2025-02-27 11:30:41.026274+00	20250214004015_init	\N	\N	2025-02-27 11:30:40.807096+00	1
4ec1508e-f4ad-4fd8-ab7f-fa3c3e05bc88	b51c36ed42fdaee57db3faff6595028ab6264ebd35fc0282a0451cf8c05dccae	2025-02-27 11:30:41.354344+00	20250214010101_checkpoint_backup	\N	\N	2025-02-27 11:30:41.115495+00	1
66089bab-bd32-4c5f-b5ac-79ca7aece8de	bfbe530bb04fa521cb0db963b6be061d70adecbb5d32722b6048247ab941f38f	2025-02-27 11:30:41.675337+00	20250226214005_add_product_models	\N	\N	2025-02-27 11:30:41.443544+00	1
a15113af-78c3-4084-8368-de064b21b74d	465fbf663c05b39097da85ef5c8bf19e12829ad93598c7eb9fac670f33f2b23f	2025-02-27 11:30:47.893159+00	20250227113047_add_page_content_model	\N	\N	2025-02-27 11:30:47.670233+00	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Approval Approval_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_pkey" PRIMARY KEY (id);


--
-- Name: CouponUsage CouponUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: CreditPackage CreditPackage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CreditPackage"
    ADD CONSTRAINT "CreditPackage_pkey" PRIMARY KEY (id);


--
-- Name: CreditTransaction CreditTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PageContent PageContent_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PageContent"
    ADD CONSTRAINT "PageContent_pkey" PRIMARY KEY (id);


--
-- Name: PaymentMethod PaymentMethod_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PaymentMethod"
    ADD CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY (id);


--
-- Name: ProductCategory ProductCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SupportCategory SupportCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."SupportCategory"
    ADD CONSTRAINT "SupportCategory_pkey" PRIMARY KEY (id);


--
-- Name: TicketMessage TicketMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Approval_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Approval_userId_idx" ON public."Approval" USING btree ("userId");


--
-- Name: CouponUsage_couponId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CouponUsage_couponId_idx" ON public."CouponUsage" USING btree ("couponId");


--
-- Name: CouponUsage_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CouponUsage_userId_idx" ON public."CouponUsage" USING btree ("userId");


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: CreditPackage_paymentMethodId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CreditPackage_paymentMethodId_idx" ON public."CreditPackage" USING btree ("paymentMethodId");


--
-- Name: CreditTransaction_couponId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CreditTransaction_couponId_idx" ON public."CreditTransaction" USING btree ("couponId");


--
-- Name: CreditTransaction_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "CreditTransaction_userId_idx" ON public."CreditTransaction" USING btree ("userId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "OrderItem_productId_idx" ON public."OrderItem" USING btree ("productId");


--
-- Name: Order_paymentMethodId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_paymentMethodId_idx" ON public."Order" USING btree ("paymentMethodId");


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: PageContent_pageKey_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PageContent_pageKey_key" ON public."PageContent" USING btree ("pageKey");


--
-- Name: Product_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Product_categoryId_idx" ON public."Product" USING btree ("categoryId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: TicketMessage_ticketId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "TicketMessage_ticketId_idx" ON public."TicketMessage" USING btree ("ticketId");


--
-- Name: TicketMessage_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "TicketMessage_userId_idx" ON public."TicketMessage" USING btree ("userId");


--
-- Name: Ticket_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Ticket_categoryId_idx" ON public."Ticket" USING btree ("categoryId");


--
-- Name: Ticket_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Ticket_userId_idx" ON public."Ticket" USING btree ("userId");


--
-- Name: Transaction_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Transaction_userId_idx" ON public."Transaction" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Approval Approval_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Approval"
    ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CouponUsage CouponUsage_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CouponUsage CouponUsage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CouponUsage"
    ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditPackage CreditPackage_paymentMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CreditPackage"
    ADD CONSTRAINT "CreditPackage_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES public."PaymentMethod"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditTransaction CreditTransaction_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CreditTransaction CreditTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_paymentMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES public."PaymentMethod"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."ProductCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TicketMessage TicketMessage_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."Ticket"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TicketMessage TicketMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."TicketMessage"
    ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."SupportCategory"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--


-- MySQL dump 10.13  Distrib 8.0.42, for Linux (aarch64)
--
-- Host: localhost    Database: moneypath
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `monthly_budget` decimal(10,2) DEFAULT NULL,
  `is_public_burden` tinyint(1) NOT NULL DEFAULT '0',
  `parent_category_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_user_id_idx` (`user_id`),
  KEY `categories_user_id_type_idx` (`user_id`,`type`),
  KEY `idx_user_public_burden` (`user_id`,`is_public_burden`),
  KEY `categories_parent_category_id_idx` (`parent_category_id`),
  CONSTRAINT `categories_parent_category_id_fkey` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `categories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('0382fc20-04df-4194-8de4-2197f6c7a31a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','電気代','expense',NULL,'⚡',12,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.654',NULL,0,NULL),('09d8eb50-2e1c-4ef0-85a4-9d4b45593842','7705e138-c92d-4a3f-a83c-e08dcdcaef46','国民健康保険','expense',NULL,'🏥',20,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.647',NULL,1,NULL),('1180ae18-b7ec-45f8-a0be-6ce65f2c54b4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','日用品','expense',NULL,'🧴',9,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.545',NULL,0,NULL),('11b023a3-8601-4953-acda-3e8c149bc734','7705e138-c92d-4a3f-a83c-e08dcdcaef46','タバコ','expense',NULL,NULL,4,'2025-11-15 15:53:48.000','2025-12-01 16:07:02.434',NULL,0,NULL),('1af99492-902f-44fb-83af-315b22f56867','7705e138-c92d-4a3f-a83c-e08dcdcaef46','食費','expense',NULL,'🍽️',0,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.426',NULL,0,NULL),('2078624b-28c0-40f1-8ab9-f27ab2d9fb50','7705e138-c92d-4a3f-a83c-e08dcdcaef46','食費 (外食)','expense',NULL,NULL,3,'2025-11-15 15:52:47.000','2025-12-01 16:07:02.429',NULL,0,'1af99492-902f-44fb-83af-315b22f56867'),('23347c25-8b6a-4968-a408-54809cf37f5b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','仕事ツール','expense',NULL,'💼',14,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.648',NULL,0,NULL),('2c905734-c62a-4d12-a532-84a62bc3f86f','7705e138-c92d-4a3f-a83c-e08dcdcaef46','美容','expense',NULL,'💅',8,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.544',NULL,0,NULL),('31aea916-51ca-4385-8039-b5bac236d2ae','7705e138-c92d-4a3f-a83c-e08dcdcaef46','食費 (自炊)','expense',NULL,NULL,1,'2025-12-03 16:01:39.884','2025-12-03 16:01:39.884',NULL,0,'1af99492-902f-44fb-83af-315b22f56867'),('453ddd7c-c187-4a0d-bc53-413d491959ce','7705e138-c92d-4a3f-a83c-e08dcdcaef46','貯金','expense',NULL,'🏦',25,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.737',NULL,0,NULL),('52e70cae-eed2-4c2d-9ac8-924cf75446a9','7705e138-c92d-4a3f-a83c-e08dcdcaef46','交通費','expense',NULL,'🚃',6,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.445',NULL,0,NULL),('61bb930d-5460-42db-a2ef-93c4df6d964c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','食費 (Uber)','expense',NULL,'🚗',2,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.433',NULL,0,'1af99492-902f-44fb-83af-315b22f56867'),('6869c908-a475-4ea8-9b96-f1103bfcbe61','7705e138-c92d-4a3f-a83c-e08dcdcaef46','送金','expense',NULL,'💸',26,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.731',NULL,0,NULL),('749a8720-74ba-4ace-a6cf-7e697e86e548','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ゲーム','expense',NULL,NULL,17,'2025-11-15 15:48:20.000','2025-12-01 16:07:02.737',NULL,0,NULL),('7c017480-e73d-468c-a30b-2bb2f82aca72','7705e138-c92d-4a3f-a83c-e08dcdcaef46','スマホ代','expense',NULL,'📱',11,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.545',NULL,0,NULL),('87a98bb8-aa16-4a65-9970-c5d8d55f05cf','7705e138-c92d-4a3f-a83c-e08dcdcaef46','服・靴','expense',NULL,'👔',7,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.542',NULL,0,NULL),('8e50936b-f11d-42c4-99af-e25c73b0bd4c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','家賃','expense',NULL,'🏠',10,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.545',NULL,0,NULL),('942105da-4c50-4932-afda-dbabb7827ca9','7705e138-c92d-4a3f-a83c-e08dcdcaef46','所得税 (申告所得税及復興特別所得税)','expense',NULL,NULL,22,'2025-11-29 11:57:21.310','2025-12-01 16:07:02.648',NULL,1,NULL),('9a3ca2b4-e69c-4feb-a8a8-5caf0101dbfe','7705e138-c92d-4a3f-a83c-e08dcdcaef46','その他','income',NULL,NULL,2,'2025-11-15 15:46:48.000','2025-11-15 15:46:48.000',NULL,0,NULL),('a444ecd4-b23e-4661-b0ef-575ae45a4e35','7705e138-c92d-4a3f-a83c-e08dcdcaef46','その他','expense',NULL,'📦',27,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.779',NULL,0,NULL),('a53fe70c-8be8-46c2-91b7-d38f5ccd4ecd','7705e138-c92d-4a3f-a83c-e08dcdcaef46','返してもらったお金','income',NULL,NULL,1,'2025-11-15 15:46:37.000','2025-11-15 15:46:37.000',NULL,0,NULL),('a600fc38-12a3-43b1-8cda-a66d132b1ff3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','市民税','expense',NULL,'🏛️',21,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.652',NULL,1,NULL),('a646147a-9349-44c1-bc4a-0f28cb88441a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','家電','expense',NULL,NULL,23,'2025-12-01 16:06:58.920','2025-12-01 16:07:02.732',NULL,0,NULL),('a7366c4c-f170-4daa-b9c4-0543ba11a12f','7705e138-c92d-4a3f-a83c-e08dcdcaef46','カラオケ','expense',NULL,NULL,18,'2025-11-15 15:48:24.000','2025-12-01 16:07:02.742',NULL,0,NULL),('b79ae113-e1f6-4983-8cd3-23daf73d8c59','7705e138-c92d-4a3f-a83c-e08dcdcaef46','贈り物','expense',NULL,NULL,24,'2025-11-29 14:42:45.794','2025-12-01 16:07:02.779',NULL,0,NULL),('bcd281b5-941a-4820-a477-c8d5e5d550dc','7705e138-c92d-4a3f-a83c-e08dcdcaef46','仕事の報酬','income',NULL,'💰',0,'2025-11-12 09:25:00.000','2025-11-15 15:46:22.000',NULL,0,NULL),('be0c1863-c931-460a-a472-960d0fc4e879','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ペット','expense',NULL,'🐕',13,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.546',NULL,0,NULL),('cb2a6724-38e7-4874-a7ea-a5059ee443bd','7705e138-c92d-4a3f-a83c-e08dcdcaef46','サブスク','expense',NULL,NULL,19,'2025-11-17 12:53:43.633','2025-12-01 16:07:02.779',NULL,0,NULL),('f16e7523-df90-4791-97fc-1206d7b9057d','7705e138-c92d-4a3f-a83c-e08dcdcaef46','筋トレ','expense',NULL,NULL,15,'2025-12-01 16:03:53.193','2025-12-01 16:07:02.741',NULL,0,NULL),('fcfc701c-93ee-42e5-8b3b-41b4991836b6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ビール','expense',NULL,'🍺',5,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.434',NULL,0,NULL),('ff4637f3-d318-48e8-95de-857e22d68ebb','7705e138-c92d-4a3f-a83c-e08dcdcaef46','娯楽','expense',NULL,'🎮',16,'2025-11-12 09:25:00.000','2025-12-01 16:07:02.644',NULL,0,NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debts`
--

DROP TABLE IF EXISTS `debts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debts` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `remaining` decimal(10,2) NOT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `debts_user_id_idx` (`user_id`),
  CONSTRAINT `debts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debts`
--

LOCK TABLES `debts` WRITE;
/*!40000 ALTER TABLE `debts` DISABLE KEYS */;
/*!40000 ALTER TABLE `debts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recurring` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_user_id_idx` (`user_id`),
  CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_amount` decimal(10,2) NOT NULL,
  `target_date` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `goals_user_id_idx` (`user_id`),
  CONSTRAINT `goals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incomes`
--

DROP TABLE IF EXISTS `incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incomes` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recurring` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `incomes_user_id_idx` (`user_id`),
  CONSTRAINT `incomes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_payments`
--

DROP TABLE IF EXISTS `scheduled_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_payments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimated_amount` decimal(10,2) NOT NULL,
  `due_date` datetime(3) NOT NULL,
  `memo` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `is_public_burden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `scheduled_payments_transaction_id_key` (`transaction_id`),
  KEY `scheduled_payments_user_id_idx` (`user_id`),
  KEY `scheduled_payments_user_id_status_idx` (`user_id`,`status`),
  KEY `scheduled_payments_category_id_fkey` (`category_id`),
  KEY `idx_user_public_burden` (`user_id`,`is_public_burden`),
  CONSTRAINT `scheduled_payments_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scheduled_payments_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `scheduled_payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_payments`
--

LOCK TABLES `scheduled_payments` WRITE;
/*!40000 ALTER TABLE `scheduled_payments` DISABLE KEYS */;
INSERT INTO `scheduled_payments` VALUES ('0a56ef79-ed32-4807-9eaf-3a9fbce90de0','7705e138-c92d-4a3f-a83c-e08dcdcaef46','8e50936b-f11d-42c4-99af-e25c73b0bd4c',135000.00,'2025-12-03 00:00:00.000',NULL,'completed','db76c88c-bbed-47c8-afca-abdbb0ac0da6','2025-12-02 11:15:43.091',0,'2025-12-01 15:21:53.362','2025-12-02 11:15:43.092'),('10db86e9-0f19-4ab8-8d7b-a19d4601f5ee','7705e138-c92d-4a3f-a83c-e08dcdcaef46','1af99492-902f-44fb-83af-315b22f56867',58400.00,'2025-12-03 00:00:00.000','コストコ','completed','0217fce6-5ae1-43d9-b48b-b2d0aeaad05f','2025-12-02 11:15:50.504',0,'2025-12-01 15:32:05.397','2025-12-02 11:15:50.505'),('1383ecc0-192a-4e18-8f84-5e2b796c40a3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','942105da-4c50-4932-afda-dbabb7827ca9',170000.00,'2025-12-31 00:00:00.000',NULL,'pending',NULL,NULL,1,'2025-12-02 11:16:55.869','2025-12-02 11:16:55.869'),('3281581b-7932-44f9-addb-44b0c82f1248','7705e138-c92d-4a3f-a83c-e08dcdcaef46','87a98bb8-aa16-4a65-9970-c5d8d55f05cf',35700.00,'2025-12-03 00:00:00.000','立て替え','completed','a164257a-58be-41f8-b1d1-0819948f2f91','2025-12-02 11:15:53.120',0,'2025-12-01 15:33:08.045','2025-12-02 11:15:53.121'),('3dc03332-3041-4191-ae3d-405b98150ba5','7705e138-c92d-4a3f-a83c-e08dcdcaef46','7c017480-e73d-468c-a30b-2bb2f82aca72',32000.00,'2025-12-03 00:00:00.000',NULL,'completed','f8175dc3-650b-49c7-87a3-61aa24f92f00','2025-12-02 11:15:54.284',0,'2025-12-01 15:33:51.378','2025-12-02 11:15:54.285'),('72ea83f5-cfab-4684-b8cd-fcce74abdffe','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',4200.00,'2025-12-03 00:00:00.000','保険','completed','5e33d140-3c16-482f-8cdd-955f2bef5e43','2025-12-02 11:15:55.180',0,'2025-12-01 15:25:42.238','2025-12-02 11:15:55.181'),('776709bc-ae6c-4bf7-9482-4270909ce418','7705e138-c92d-4a3f-a83c-e08dcdcaef46','b79ae113-e1f6-4983-8cd3-23daf73d8c59',6966.00,'2025-12-01 00:00:00.000',NULL,'completed',NULL,'2025-11-29 15:30:12.423',0,'2025-11-29 14:43:23.357','2025-11-29 15:30:12.423'),('aee86ed6-7edb-4c41-85d9-ac1a963d399c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',25900.00,'2025-12-03 00:00:00.000','ごもだい','completed','abb84d8a-de23-4645-8f06-4b1b3d420f9b','2025-12-02 11:15:55.952',0,'2025-12-01 15:25:42.272','2025-12-02 11:15:55.953'),('b845169f-0058-4d7d-8cde-a0fb9dd4033b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','23347c25-8b6a-4968-a408-54809cf37f5b',31571.00,'2025-12-03 00:00:00.000','Claude','completed','a8cba47b-7111-4348-8ca5-6cd0ceffc140','2025-12-02 11:15:56.739',0,'2025-12-01 15:31:13.636','2025-12-02 11:15:56.740'),('d3a81d33-a771-447f-b808-23d81ad8a894','7705e138-c92d-4a3f-a83c-e08dcdcaef46','cb2a6724-38e7-4874-a7ea-a5059ee443bd',5280.00,'2025-12-03 00:00:00.000','コストコ年会費','completed','5ef251ce-9991-4e1f-bf15-ee2601085cf0','2025-12-02 11:15:57.561',0,'2025-12-01 15:32:26.232','2025-12-02 11:15:57.562'),('ed4f5305-0d96-4f04-a85f-fd314ec2729b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',3200.00,'2025-12-03 00:00:00.000','保険','completed','37b1b47c-f8b6-4fc5-a693-6b13728c4cb1','2025-12-02 11:15:58.337',0,'2025-12-01 15:25:42.300','2025-12-02 11:15:58.338'),('f19c8700-d9de-4f4a-8573-11b9169c1c99','7705e138-c92d-4a3f-a83c-e08dcdcaef46','942105da-4c50-4932-afda-dbabb7827ca9',182500.00,'2026-01-30 00:00:00.000','延滞税あり、電話で要チェック','pending',NULL,NULL,1,'2025-12-02 11:16:55.894','2025-12-02 11:16:55.894');
/*!40000 ALTER TABLE `scheduled_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_user_id_idx` (`user_id`),
  KEY `transactions_user_id_date_idx` (`user_id`,`date`),
  KEY `transactions_category_id_idx` (`category_id`),
  CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES ('0217fce6-5ae1-43d9-b48b-b2d0aeaad05f','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',58400.00,'コストコ','2025-12-02 11:15:50.478','2025-12-02 11:15:50.491','2025-12-02 11:15:50.491'),('044c1535-df59-4eaf-942f-5d59adbd68ff','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',150.00,'','2025-12-09 00:00:00.000','2025-12-09 12:11:15.736','2025-12-09 12:11:15.736'),('054549a9-3718-4932-bb87-f0b3b96ebdc6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','52e70cae-eed2-4c2d-9ac8-924cf75446a9',12000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:07.000','2025-11-15 15:42:07.000'),('087d6217-e3c6-4c73-8cc7-776fb7aadd24','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',120.00,'缶コーヒー','2025-11-19 00:00:00.000','2025-11-19 03:20:37.756','2025-11-19 03:20:37.756'),('0b03689d-d013-40e1-9fcf-5524041d6ee3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',21562.00,'','2025-11-24 00:00:00.000','2025-11-29 12:08:24.739','2025-11-29 12:08:24.739'),('0bf6ceeb-7cfe-41b8-9ab2-0b75a3f9dd41','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',501.00,'','2025-12-02 00:00:00.000','2025-12-03 13:59:23.300','2025-12-03 13:59:23.300'),('0c43faa9-52d4-4bfe-bd7a-f57147e793b6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',4243.00,'','2025-11-25 00:00:00.000','2025-11-29 12:07:24.662','2025-11-29 12:07:24.662'),('0c761729-3ea3-434c-a073-6dc6e2bc83e8','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2810.00,'','2025-12-02 00:00:00.000','2025-12-03 14:23:03.933','2025-12-03 14:23:03.933'),('10d56770-8411-4102-a21b-a605271b66eb','7705e138-c92d-4a3f-a83c-e08dcdcaef46','1180ae18-b7ec-45f8-a0be-6ce65f2c54b4',23000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:22.000','2025-11-15 15:42:22.000'),('127359bb-500d-41d3-ad1a-e36959dc6601','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2204.00,'','2025-12-06 00:00:00.000','2025-12-06 16:11:48.981','2025-12-06 16:11:48.981'),('12c7fde7-1148-4e54-bad6-fe8591a31054','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',14024.00,'','2025-11-01 00:00:00.000','2025-11-15 08:31:19.000','2025-11-15 08:31:19.000'),('13215266-892b-4c17-8526-97769259a781','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',130.00,'','2025-12-05 00:00:00.000','2025-12-06 16:10:19.889','2025-12-06 16:10:19.889'),('14c9d6c8-afc0-44ab-b964-65ba5c18d2d6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','bcd281b5-941a-4820-a477-c8d5e5d550dc',1000.00,'拾った','2025-11-01 00:00:00.000','2025-11-15 08:31:47.000','2025-11-15 08:31:47.000'),('1546f61d-098e-4d58-9c26-3bf84be77fcd','7705e138-c92d-4a3f-a83c-e08dcdcaef46','52e70cae-eed2-4c2d-9ac8-924cf75446a9',3000.00,'','2025-11-28 00:00:00.000','2025-11-29 11:39:07.452','2025-11-29 11:39:07.452'),('1907dba3-b0a2-4e28-9ba2-a799626c6ccf','7705e138-c92d-4a3f-a83c-e08dcdcaef46','bcd281b5-941a-4820-a477-c8d5e5d550dc',38054.00,'株式会社リクリエ','2025-12-31 00:00:00.000','2025-12-01 16:21:41.334','2025-12-01 16:21:41.334'),('1a24a512-3901-4473-a672-7ddcdd8c7cfa','7705e138-c92d-4a3f-a83c-e08dcdcaef46','9a3ca2b4-e69c-4feb-a8a8-5caf0101dbfe',50000.00,'貯金から引き出し','2025-11-30 00:00:00.000','2025-12-01 15:57:29.427','2025-12-01 16:16:02.406'),('1c909994-59d3-40fb-8666-4f81ed880ca6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','11b023a3-8601-4953-acda-3e8c149bc734',1200.00,'','2025-12-10 00:00:00.000','2025-12-10 05:42:56.559','2025-12-10 05:42:56.559'),('1eb0ae34-5383-4752-9e8c-e684019dae14','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',761.00,'','2025-12-09 00:00:00.000','2025-12-09 12:12:04.973','2025-12-09 12:12:04.973'),('206487b8-df67-4f68-91b9-920e143b522a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','0382fc20-04df-4194-8de4-2197f6c7a31a',30364.00,'','2025-12-09 00:00:00.000','2025-12-09 12:11:49.347','2025-12-09 12:11:49.347'),('2191127e-f618-4f71-bea9-cc902e0618d3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',6039.00,'','2025-11-24 00:00:00.000','2025-11-29 12:07:44.243','2025-11-29 12:07:44.243'),('21d7f838-c3a8-472d-bebe-129e5bcb13e2','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',5103.00,'','2025-12-05 00:00:00.000','2025-12-06 16:10:31.365','2025-12-06 16:10:31.365'),('24a5ddba-61c3-4ee6-b208-671474d5e523','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2000.00,'','2025-11-22 00:00:00.000','2025-11-29 12:10:03.465','2025-11-29 12:10:03.465'),('2640610a-66e0-4535-aefe-4b949f5b0910','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',6193.00,'','2025-12-04 00:00:00.000','2025-12-06 16:09:48.884','2025-12-06 16:09:48.884'),('267cf01c-794f-4be8-bbbf-1e1009044fbd','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2984.00,'','2025-12-10 00:00:00.000','2025-12-10 05:43:09.516','2025-12-10 05:43:09.516'),('2f1ee441-eadd-45db-8c16-c5f540803670','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2072.00,'コンビニ','2025-11-30 00:00:00.000','2025-12-01 16:13:53.669','2025-12-01 16:13:53.669'),('2f2eb251-997a-44bc-a015-1f6e7a26b47b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',19860.00,'','2025-11-28 00:00:00.000','2025-11-29 11:39:47.229','2025-11-29 11:39:47.229'),('3133f78e-1a26-4723-a261-f45a6c718186','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',498.00,'','2025-11-25 00:00:00.000','2025-11-29 12:07:31.380','2025-11-29 12:07:31.380'),('32897592-8b61-43cc-8d68-6da5130c86d4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',33300.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:46.000','2025-11-15 15:42:46.000'),('36adfcc4-a1ae-4677-8bec-5d6fd923d978','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',5667.00,'','2025-11-06 00:00:00.000','2025-11-15 15:44:52.000','2025-11-15 15:44:52.000'),('37b1b47c-f8b6-4fc5-a693-6b13728c4cb1','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',3200.00,'保険','2025-12-02 11:15:58.336','2025-12-02 11:15:58.337','2025-12-02 11:15:58.337'),('37d41e8a-dc28-408e-9bcc-8877d27562af','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',300.00,'','2025-11-15 00:00:00.000','2025-11-15 15:54:17.000','2025-11-15 15:54:17.000'),('3e1e4cc2-2b0d-4fcf-81b1-8c50d09a756a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2777.00,'','2025-11-28 00:00:00.000','2025-11-29 11:39:20.557','2025-11-29 11:39:20.557'),('428237bd-bc07-4997-acb3-a253bcc3741f','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',9840.00,'夕飯','2025-12-07 00:00:00.000','2025-12-09 12:10:27.250','2025-12-09 12:10:27.250'),('44256731-844b-4ee3-bd44-f6ac30da0a44','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',130.00,'','2025-12-09 00:00:00.000','2025-12-09 12:11:19.341','2025-12-09 12:11:19.341'),('442ca2d5-2816-4cfa-8e42-f505c260ea03','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',4719.00,'','2025-11-23 00:00:00.000','2025-11-29 12:09:40.558','2025-11-29 12:09:40.558'),('46c59371-6724-4521-8cf5-2308df4892ff','7705e138-c92d-4a3f-a83c-e08dcdcaef46','453ddd7c-c187-4a0d-bc53-413d491959ce',150000.00,'10万下ろしていた分と今月振り込み予定だったのを足して15万円','2025-12-02 00:00:00.000','2025-12-02 11:17:47.534','2025-12-02 11:17:47.534'),('47e54d00-046b-4448-bce6-f01a59a71b57','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',7611.00,'','2025-11-02 00:00:00.000','2025-11-15 08:32:16.000','2025-11-15 08:32:16.000'),('4ab5c37b-0ce8-4fa6-9908-5c763dc8ccfe','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',3400.00,'','2025-11-22 00:00:00.000','2025-11-29 12:10:46.313','2025-11-29 12:10:46.313'),('4bf4a2a7-aa59-4f9b-b2fb-d5a054bbfd65','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2670.00,'','2025-12-02 00:00:00.000','2025-12-03 14:23:11.941','2025-12-03 14:23:11.941'),('4eda0787-ca80-48ed-a481-ce6f9310d0c2','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',300.00,'','2025-11-14 00:00:00.000','2025-11-15 15:53:17.000','2025-11-15 15:53:17.000'),('50442804-b95c-4b96-8599-e032434fd93f','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',2590.00,'','2025-11-07 00:00:00.000','2025-11-15 15:45:20.000','2025-11-15 15:45:20.000'),('50df2a31-331c-4ac8-a711-1a70dc6faa50','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',4000.00,'無印','2025-12-07 00:00:00.000','2025-12-09 12:10:03.220','2025-12-09 12:10:03.220'),('51b46ef9-f3ed-45a8-a95e-039ee3b1fe73','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',3005.00,'','2025-11-14 00:00:00.000','2025-11-15 15:53:27.000','2025-11-15 15:53:27.000'),('53568114-1752-4631-99e9-b74d19afe965','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',21800.00,'年末のディズニー代','2025-12-05 00:00:00.000','2025-12-06 16:11:07.889','2025-12-06 16:11:07.889'),('5839f87c-54db-48a8-92b1-e03f6115dc42','7705e138-c92d-4a3f-a83c-e08dcdcaef46','09d8eb50-2e1c-4ef0-85a4-9d4b45593842',5000.00,'令和7年度 第4期','2025-12-02 00:00:00.000','2025-12-03 13:53:17.379','2025-12-03 13:53:17.379'),('5a3efd92-7df0-49d4-be66-5ade38a93aa7','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',6089.00,'','2025-11-13 00:00:00.000','2025-11-15 15:51:32.000','2025-11-15 15:51:32.000'),('5a5300e2-3696-4321-8d97-7eefcc21a06a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','fcfc701c-93ee-42e5-8b3b-41b4991836b6',12980.00,'','2025-11-04 00:00:00.000','2025-11-15 15:41:50.000','2025-11-15 15:41:50.000'),('5e2c5874-3bca-4b32-beb6-b91c3c7f7eeb','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',200.00,'','2025-11-10 00:00:00.000','2025-11-15 15:49:59.000','2025-11-15 15:49:59.000'),('5e33d140-3c16-482f-8cdd-955f2bef5e43','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',4200.00,'保険','2025-12-02 11:15:55.176','2025-12-02 11:15:55.177','2025-12-02 11:15:55.177'),('5ef251ce-9991-4e1f-bf15-ee2601085cf0','7705e138-c92d-4a3f-a83c-e08dcdcaef46','cb2a6724-38e7-4874-a7ea-a5059ee443bd',5280.00,'コストコ年会費','2025-12-02 11:15:57.559','2025-12-02 11:15:57.560','2025-12-02 11:15:57.560'),('6172e4fe-1d9d-4115-9d3b-c22521dc5ac5','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',1419.00,'','2025-12-02 00:00:00.000','2025-12-03 14:23:29.899','2025-12-03 14:23:29.899'),('67307271-7ef2-44b5-8da9-67e51e5b29f3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a646147a-9349-44c1-bc4a-0f28cb88441a',13284.00,'除湿機','2025-12-02 00:00:00.000','2025-12-01 16:06:46.404','2025-12-01 16:07:15.838'),('6736acdb-27ed-4f90-a47b-8eac63eb4212','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',20.00,'','2025-11-04 00:00:00.000','2025-11-15 15:43:07.000','2025-11-15 15:43:07.000'),('683541ee-2088-4c81-8b58-36fcffe6c1b7','7705e138-c92d-4a3f-a83c-e08dcdcaef46','9a3ca2b4-e69c-4feb-a8a8-5caf0101dbfe',850.00,'','2025-11-23 00:00:00.000','2025-11-29 12:09:15.770','2025-11-29 12:09:15.770'),('698f39c2-5f80-4228-9575-167566b0c9ac','7705e138-c92d-4a3f-a83c-e08dcdcaef46','7c017480-e73d-468c-a30b-2bb2f82aca72',1500.00,'','2025-12-05 00:00:00.000','2025-12-06 16:10:05.512','2025-12-06 16:10:05.512'),('6bdcc702-91c6-4a0c-9734-4b942e26fff3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',12000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:43:00.000','2025-11-15 15:43:00.000'),('7084caa7-8c46-4289-bf94-309d10d21080','7705e138-c92d-4a3f-a83c-e08dcdcaef46','1180ae18-b7ec-45f8-a0be-6ce65f2c54b4',6411.00,'','2025-11-20 00:00:00.000','2025-11-21 12:14:40.305','2025-11-21 12:14:40.305'),('7132cf9e-8053-4a42-b59c-4c5bbccd3bdf','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2c905734-c62a-4d12-a532-84a62bc3f86f',24500.00,'','2025-11-02 00:00:00.000','2025-11-15 08:33:13.000','2025-11-15 08:33:13.000'),('7260f166-3685-4bd9-95cf-9eb2cc6e1b0f','7705e138-c92d-4a3f-a83c-e08dcdcaef46','1180ae18-b7ec-45f8-a0be-6ce65f2c54b4',4240.00,'日用品','2025-12-07 00:00:00.000','2025-12-09 12:10:15.669','2025-12-09 12:10:15.669'),('735ead82-751e-49fa-a622-d7700d6870bf','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',3087.00,'','2025-11-16 00:00:00.000','2025-11-16 11:53:23.000','2025-11-16 11:53:23.000'),('757e8751-154b-4a0d-b3a4-b03540f1c2ea','7705e138-c92d-4a3f-a83c-e08dcdcaef46','f16e7523-df90-4791-97fc-1206d7b9057d',5000.00,'ベンチ','2025-12-02 00:00:00.000','2025-12-01 16:04:48.695','2025-12-01 16:04:48.695'),('79981743-a81e-4614-974e-25001fc23f61','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',1273.00,'','2025-11-19 00:00:00.000','2025-11-21 12:13:45.114','2025-11-21 12:13:45.114'),('7b50cc4b-49c8-4bfb-b629-da5c187550e5','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2500.00,'','2025-11-30 00:00:00.000','2025-12-01 15:59:06.581','2025-12-01 15:59:06.581'),('8192e9d8-782f-4b78-a8d9-f1980ee1b7fd','7705e138-c92d-4a3f-a83c-e08dcdcaef46','52e70cae-eed2-4c2d-9ac8-924cf75446a9',2600.00,'','2025-11-30 00:00:00.000','2025-12-01 16:14:02.515','2025-12-01 16:14:02.515'),('81c060bd-46fd-41f7-8e71-717b56becfdb','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',85.00,'実際の資産との調整','2025-12-02 00:00:00.000','2025-12-01 16:20:37.567','2025-12-01 16:20:37.567'),('8c6a2d21-de39-4ec9-922d-f5a50e36ce00','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',1225.00,'','2025-11-17 00:00:00.000','2025-11-17 12:52:48.677','2025-11-17 12:52:48.677'),('90404a06-749f-4958-ba82-710a7b9d53d3','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',14820.00,'鳥貴族','2025-11-30 00:00:00.000','2025-12-01 16:13:12.495','2025-12-01 16:13:12.495'),('917ea193-7761-4b8e-a6ca-b4d43aeb0327','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2060.00,'','2025-11-17 00:00:00.000','2025-11-17 09:00:22.515','2025-11-17 09:00:22.515'),('9346ef10-bb4b-4535-98f5-994e183d5f18','7705e138-c92d-4a3f-a83c-e08dcdcaef46','87a98bb8-aa16-4a65-9970-c5d8d55f05cf',9680.00,'GU','2025-12-07 00:00:00.000','2025-12-09 12:09:39.837','2025-12-09 12:09:39.837'),('95767051-6e97-4ff3-9a4f-e570113b08da','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',120.00,'','2025-11-29 00:00:00.000','2025-11-29 12:05:49.028','2025-11-29 12:05:49.028'),('96366e75-2e48-4caa-8c64-f8f893e5097b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',180.00,'缶ジュース','2025-11-19 00:00:00.000','2025-11-19 03:20:43.789','2025-11-19 03:20:43.789'),('97886bcb-2ca6-4fb4-be22-0ba8f5d4700c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',18319.00,'資産とのずれ調整金','2025-11-29 00:00:00.000','2025-11-29 12:16:16.921','2025-11-29 12:16:16.921'),('9a2de626-f5b1-410d-9009-4104d7b0f2d0','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',3300.00,'','2025-11-15 00:00:00.000','2025-11-15 15:54:13.000','2025-11-15 15:54:13.000'),('9f5f4b97-dffd-475e-a528-c825da2ee719','7705e138-c92d-4a3f-a83c-e08dcdcaef46','7c017480-e73d-468c-a30b-2bb2f82aca72',32000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:40.000','2025-11-15 15:42:40.000'),('a164257a-58be-41f8-b1d1-0819948f2f91','7705e138-c92d-4a3f-a83c-e08dcdcaef46','87a98bb8-aa16-4a65-9970-c5d8d55f05cf',35700.00,'立て替え','2025-12-02 11:15:53.119','2025-12-02 11:15:53.120','2025-12-02 11:15:53.120'),('a33de5a6-aa0a-44ad-a6bb-48d42c48498d','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',5620.00,'','2025-11-09 00:00:00.000','2025-11-15 15:47:24.000','2025-11-15 15:47:24.000'),('a4a452c0-4741-4444-86ba-da8a89c9b5be','7705e138-c92d-4a3f-a83c-e08dcdcaef46','0382fc20-04df-4194-8de4-2197f6c7a31a',28311.00,'','2025-11-10 00:00:00.000','2025-11-15 15:49:52.000','2025-11-15 15:49:52.000'),('a52491e5-cda0-478b-9bcf-8acd62ea00c1','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',300.00,'オレンジジュース','2025-12-07 00:00:00.000','2025-12-09 12:10:40.415','2025-12-09 12:10:40.415'),('a72dce96-dc6f-4ca1-a75d-5145c63873e4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',5742.00,'','2025-11-08 00:00:00.000','2025-11-15 15:45:39.000','2025-11-15 15:45:39.000'),('a7b3a614-ece0-478c-9a85-93bfbd4fb007','7705e138-c92d-4a3f-a83c-e08dcdcaef46','1180ae18-b7ec-45f8-a0be-6ce65f2c54b4',3005.00,'','2025-11-09 00:00:00.000','2025-11-15 15:47:40.000','2025-11-15 15:47:40.000'),('a8cba47b-7111-4348-8ca5-6cd0ceffc140','7705e138-c92d-4a3f-a83c-e08dcdcaef46','23347c25-8b6a-4968-a408-54809cf37f5b',31571.00,'Claude','2025-12-02 11:15:56.738','2025-12-02 11:15:56.739','2025-12-02 11:15:56.739'),('a9147baf-d192-4eb2-8b6e-153b1ce2ebf1','7705e138-c92d-4a3f-a83c-e08dcdcaef46','23347c25-8b6a-4968-a408-54809cf37f5b',30000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:52.000','2025-11-15 15:42:52.000'),('a9bb3115-d32c-457e-92a4-a1a3152e76f4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',2550.00,'','2025-11-23 00:00:00.000','2025-11-29 12:09:31.645','2025-11-29 12:09:31.645'),('ab43ddfe-e21b-4204-a946-ca6c27836706','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',6578.00,'','2025-11-19 00:00:00.000','2025-11-21 12:13:33.378','2025-11-21 12:13:33.378'),('abb84d8a-de23-4645-8f06-4b1b3d420f9b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',25900.00,'ごもだい','2025-12-02 11:15:55.951','2025-12-02 11:15:55.951','2025-12-02 11:15:55.951'),('ac627def-4d0d-49eb-858a-4910d2afd61c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',12051.00,'','2025-11-03 00:00:00.000','2025-11-15 15:19:46.000','2025-11-15 15:19:46.000'),('adf09766-7cc8-4a08-ad5b-e4f23fa2836c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',2242.00,'','2025-11-24 00:00:00.000','2025-11-29 12:08:32.984','2025-11-29 12:08:32.984'),('afc58577-49a5-4926-a119-b7bd4fce79a8','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',2461.00,'','2025-11-23 00:00:00.000','2025-11-29 12:08:54.738','2025-11-29 12:08:54.738'),('b0d97fae-fe0a-4506-85e0-7d66049b3be1','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',3873.00,'','2025-12-03 00:00:00.000','2025-12-03 14:23:55.683','2025-12-03 14:23:55.683'),('b2ef1eff-c954-4068-9f55-bed66f801f66','7705e138-c92d-4a3f-a83c-e08dcdcaef46','87a98bb8-aa16-4a65-9970-c5d8d55f05cf',16190.00,'','2025-11-09 00:00:00.000','2025-11-15 15:47:33.000','2025-11-15 15:47:33.000'),('b518b26e-8213-4de0-a0cc-d9c0bdb2af08','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',1800.00,'','2025-11-27 00:00:00.000','2025-11-29 12:06:31.439','2025-11-29 12:06:31.439'),('ba584cc2-1c4f-47ed-b611-d7ee466b7a5a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','87a98bb8-aa16-4a65-9970-c5d8d55f05cf',12000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:13.000','2025-11-15 15:42:13.000'),('bd5124bd-3c29-4213-9c07-521a8ec2a8aa','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',300.00,'','2025-11-14 00:00:00.000','2025-11-15 15:53:13.000','2025-11-15 15:53:13.000'),('c1135804-7da2-473e-bc5e-b54f1c6a309b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','bcd281b5-941a-4820-a477-c8d5e5d550dc',781000.00,'株式会社うるる (シンクルー株式会社)','2025-12-31 00:00:00.000','2025-12-01 16:21:09.871','2025-12-01 16:21:09.871'),('c19672f7-d95c-4ead-99f6-da6c056e426d','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',13295.00,'','2025-11-10 00:00:00.000','2025-11-15 15:49:40.000','2025-11-15 15:49:40.000'),('c2b89f61-3a46-4d27-9067-849ea9825ac4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','11b023a3-8601-4953-acda-3e8c149bc734',1160.00,'','2025-11-17 00:00:00.000','2025-11-17 12:52:20.297','2025-11-17 12:52:20.297'),('c3babc82-e706-46f9-96fb-73c55e9b557c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','749a8720-74ba-4ace-a6cf-7e697e86e548',3000.00,'','2025-11-15 00:00:00.000','2025-11-15 16:40:08.000','2025-11-15 16:40:08.000'),('ccd253b1-9fa9-463d-b09e-39242b897634','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a646147a-9349-44c1-bc4a-0f28cb88441a',7500.00,'デロンギ (コーヒー豆挽き)','2025-12-02 00:00:00.000','2025-12-01 16:06:16.173','2025-12-01 16:17:44.096'),('d096cfd6-23a6-494a-aec5-0ce5d4cb5063','7705e138-c92d-4a3f-a83c-e08dcdcaef46','bcd281b5-941a-4820-a477-c8d5e5d550dc',193629.00,'株式会社リクリエ','2025-11-28 00:00:00.000','2025-11-29 11:40:42.903','2025-11-29 11:40:42.903'),('d0d96b65-b41d-4714-a18d-a89cf8464125','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',2110.00,'','2025-11-08 00:00:00.000','2025-11-15 15:45:31.000','2025-11-15 15:45:31.000'),('d2391896-fe63-4716-b1c0-0d6ff4089476','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',13694.00,'','2025-11-14 00:00:00.000','2025-11-15 15:53:06.000','2025-11-15 15:53:06.000'),('d2ccbc0f-edfc-48bd-a89d-15562ea8bf6e','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',140.00,'','2025-11-27 00:00:00.000','2025-11-29 12:06:20.699','2025-11-29 12:06:20.699'),('d765e2f6-793c-4cb5-8439-3089951438a5','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',1854.00,'','2025-11-24 00:00:00.000','2025-11-29 12:08:45.780','2025-11-29 12:08:45.780'),('db76c88c-bbed-47c8-afca-abdbb0ac0da6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','8e50936b-f11d-42c4-99af-e25c73b0bd4c',135000.00,'家賃','2025-12-02 11:15:43.088','2025-12-02 11:15:43.089','2025-12-02 11:15:43.089'),('dd08ce1c-65ea-4ced-ac19-2d0ed75e692a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',12161.00,'','2025-11-11 00:00:00.000','2025-11-15 15:50:06.000','2025-11-15 15:50:06.000'),('df1b6ea4-650e-40ad-9961-0a4ffa1b86d7','7705e138-c92d-4a3f-a83c-e08dcdcaef46','1180ae18-b7ec-45f8-a0be-6ce65f2c54b4',885.00,'','2025-11-07 00:00:00.000','2025-11-15 15:45:09.000','2025-11-15 15:45:09.000'),('dfd07aef-e5c8-4132-8ef8-fb3d0da9c6e2','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',140.00,'','2025-12-05 00:00:00.000','2025-12-06 16:10:17.146','2025-12-06 16:10:17.146'),('e14843cf-773f-4ba7-9752-fc4750a84f95','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',5000.00,'バイオエタノール','2025-12-02 00:00:00.000','2025-12-01 16:03:04.054','2025-12-01 16:03:04.054'),('e302201a-60b5-4857-ac69-fb3ba85485fc','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a53fe70c-8be8-46c2-91b7-d38f5ccd4ecd',20000.00,'','2025-11-08 00:00:00.000','2025-11-15 15:47:15.000','2025-11-15 15:47:15.000'),('e3433f6f-884b-4621-aca7-fc5a218f8def','7705e138-c92d-4a3f-a83c-e08dcdcaef46','bcd281b5-941a-4820-a477-c8d5e5d550dc',781000.00,'株式会社うるる (シンクルー株式会社)','2025-11-28 00:00:00.000','2025-12-01 15:58:14.119','2025-12-01 16:14:37.313'),('e46d64de-8bd1-4d45-a495-6c8fdceb193c','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',2288.00,'','2025-11-28 00:00:00.000','2025-11-29 12:06:04.052','2025-11-29 12:06:04.052'),('e4aaab98-b1e9-4c8c-9fa1-f634db1d1fe4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',7528.00,'','2025-11-24 00:00:00.000','2025-11-29 12:08:01.547','2025-11-29 12:08:01.547'),('e6a69fef-ede0-4cde-a8eb-7fdc8e4247fa','7705e138-c92d-4a3f-a83c-e08dcdcaef46','8e50936b-f11d-42c4-99af-e25c73b0bd4c',135000.00,'','2025-11-04 00:00:00.000','2025-11-15 15:42:30.000','2025-11-15 15:42:30.000'),('e811c758-b144-4a60-89cc-927517936756','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a7366c4c-f170-4daa-b9c4-0543ba11a12f',4257.00,'','2025-11-28 00:00:00.000','2025-11-29 11:39:32.445','2025-11-29 11:39:32.445'),('e882be2d-dc56-470b-a932-ee08c2e4f2f8','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',236.00,'','2025-12-07 00:00:00.000','2025-12-09 12:08:44.284','2025-12-09 12:08:44.284'),('e95dcaed-ad09-48ef-8962-435b8e190bf1','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',170.00,'','2025-12-09 00:00:00.000','2025-12-09 12:11:16.924','2025-12-09 12:11:16.924'),('eb465f4f-5a3f-4249-b8f5-fcb35ee12b75','7705e138-c92d-4a3f-a83c-e08dcdcaef46','11b023a3-8601-4953-acda-3e8c149bc734',1200.00,'','2025-11-30 00:00:00.000','2025-12-01 16:13:31.864','2025-12-01 16:13:31.864'),('ebcaf579-9126-4fe7-bd6a-52f17f9cf197','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',2387.00,'','2025-11-24 00:00:00.000','2025-11-29 12:08:14.061','2025-11-29 12:08:14.061'),('f1930d00-2171-4efe-8353-3b15a29ba7e7','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',2478.00,'','2025-11-23 00:00:00.000','2025-11-29 12:09:04.531','2025-11-29 12:09:04.531'),('f25ec7cb-3b1a-4234-8c71-0e9038da4baf','7705e138-c92d-4a3f-a83c-e08dcdcaef46','942105da-4c50-4932-afda-dbabb7827ca9',352000.00,'','2025-11-28 00:00:00.000','2025-11-29 11:58:08.053','2025-11-29 11:58:08.053'),('f4e26f40-16dd-406e-a887-1efb3830d118','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',3451.00,'','2025-12-06 00:00:00.000','2025-12-06 16:11:17.208','2025-12-06 16:11:17.208'),('f5d24d48-0644-4baa-8edd-a936949d83c6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a53fe70c-8be8-46c2-91b7-d38f5ccd4ecd',940.00,'ユウマから新幹線代','2025-12-08 00:00:00.000','2025-12-09 12:11:01.103','2025-12-09 12:11:01.103'),('f5e31be1-ae32-4b3f-813c-26e9f4bcee41','7705e138-c92d-4a3f-a83c-e08dcdcaef46','be0c1863-c931-460a-a472-960d0fc4e879',2872.00,'','2025-11-19 00:00:00.000','2025-11-21 12:13:24.889','2025-11-21 12:13:24.889'),('f604ea79-ea26-480c-9e64-b73654191f4b','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',8000.00,'','2025-11-09 00:00:00.000','2025-11-15 15:47:47.000','2025-11-15 15:47:47.000'),('f80db2cb-59de-4c44-a157-cf0ed3221bc6','7705e138-c92d-4a3f-a83c-e08dcdcaef46','a444ecd4-b23e-4661-b0ef-575ae45a4e35',22789.00,'','2025-11-12 00:00:00.000','2025-11-15 15:50:18.000','2025-11-15 15:50:30.000'),('f8175dc3-650b-49c7-87a3-61aa24f92f00','7705e138-c92d-4a3f-a83c-e08dcdcaef46','7c017480-e73d-468c-a30b-2bb2f82aca72',32000.00,'スマホ代','2025-12-02 11:15:54.283','2025-12-02 11:15:54.284','2025-12-02 11:15:54.284'),('f9dbcfce-94b5-44cc-a050-03cc85f1e540','7705e138-c92d-4a3f-a83c-e08dcdcaef46','52e70cae-eed2-4c2d-9ac8-924cf75446a9',2300.00,'','2025-11-02 00:00:00.000','2025-11-15 08:33:02.000','2025-11-15 08:33:02.000'),('f9ea5b1b-9c37-4f10-b049-3540e7cdc8a4','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',34403.00,'','2025-11-04 00:00:00.000','2025-11-15 15:41:41.000','2025-11-15 15:41:41.000'),('fa7b110d-47c8-414b-8e36-e1a0fd7ff5c1','7705e138-c92d-4a3f-a83c-e08dcdcaef46','61bb930d-5460-42db-a2ef-93c4df6d964c',2855.00,'','2025-12-09 00:00:00.000','2025-12-09 12:11:24.464','2025-12-09 12:11:24.464'),('fac257fa-2550-4d98-a552-9d5a7a20042a','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',160.00,'','2025-11-27 00:00:00.000','2025-11-29 12:06:19.406','2025-11-29 12:06:19.406'),('fd9c6b84-7fcb-4765-ad38-831a13995129','7705e138-c92d-4a3f-a83c-e08dcdcaef46','ff4637f3-d318-48e8-95de-857e22d68ebb',1500.00,'','2025-11-05 00:00:00.000','2025-11-15 15:43:21.000','2025-11-15 15:43:21.000'),('fd9fdcfc-7710-43af-b3f7-0733965153be','7705e138-c92d-4a3f-a83c-e08dcdcaef46','453ddd7c-c187-4a0d-bc53-413d491959ce',100000.00,'','2025-11-29 00:00:00.000','2025-11-29 13:39:51.397','2025-11-29 13:39:51.397'),('fdadd672-89b8-4352-b22a-81bca5b8db41','7705e138-c92d-4a3f-a83c-e08dcdcaef46','52e70cae-eed2-4c2d-9ac8-924cf75446a9',10000.00,'俺と妻のも','2025-12-02 00:00:00.000','2025-12-03 13:54:11.325','2025-12-03 13:54:11.325'),('ff28d74d-3025-4874-8837-197f3fe7509e','7705e138-c92d-4a3f-a83c-e08dcdcaef46','2078624b-28c0-40f1-8ab9-f27ab2d9fb50',7880.00,'サイゼ','2025-12-05 00:00:00.000','2025-12-06 16:11:36.528','2025-12-06 16:11:36.528'),('ff4aed33-b3e4-4d66-9973-c2d1486d6a23','7705e138-c92d-4a3f-a83c-e08dcdcaef46','31aea916-51ca-4385-8039-b5bac236d2ae',19971.00,'','2025-11-07 00:00:00.000','2025-11-15 15:45:01.000','2025-11-15 15:45:01.000');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('7705e138-c92d-4a3f-a83c-e08dcdcaef46','msfm.kumagai@gmail.com','$2b$10$RUCP.OLAXQcMU6r2ARfaNuBL0IIq2oIlci8EfTS0fZhFI9EdmsWpa','masafumi kumagai','2025-11-12 06:56:09.000','2025-11-15 15:22:45.000'),('bfdbacf6-252a-41cd-a3ec-a64fd1eee6e1','test@example.com','$2b$10$InBlGfnMH9MP6s2R/ymXE.KK5wI.kgzemae58hRKiWNe3t8WxN0Iy','Test User','2025-11-12 06:52:35.000','2025-11-12 06:52:35.000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-20 15:08:48

-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: localhost    Database: edulocal
-- ------------------------------------------------------
-- Server version	8.0.35

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
-- Table structure for table `asignaturas`
--

DROP TABLE IF EXISTS `asignaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `centro_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `centro_id` (`centro_id`),
  CONSTRAINT `asignaturas_ibfk_1` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaturas`
--

LOCK TABLES `asignaturas` WRITE;
/*!40000 ALTER TABLE `asignaturas` DISABLE KEYS */;
INSERT INTO `asignaturas` VALUES (1,'Literatura',NULL,2),(2,'Historia',NULL,2),(3,'Filosofia',NULL,2),(4,'Ciencias Naturales',NULL,2),(5,'Economia',NULL,2),(6,'Religion',NULL,2),(7,'Frances',NULL,2),(8,'Ingles',NULL,2),(9,'Matematicas',NULL,2),(10,'Electrotecnia',NULL,2),(11,'Quimica',NULL,2),(12,'Fisica',NULL,2),(13,'Geologia',NULL,2);
/*!40000 ALTER TABLE `asignaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centro_configuracion`
--

DROP TABLE IF EXISTS `centro_configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_configuracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centro_id` int NOT NULL,
  `ano_academico` varchar(20) NOT NULL,
  `idioma_sistema` varchar(20) NOT NULL,
  `zona_horaria` varchar(20) NOT NULL,
  `sistema_calificacion` varchar(20) NOT NULL,
  `inicio_ano_academico` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_centro_config` (`centro_id`),
  CONSTRAINT `fk_config_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_configuracion`
--

LOCK TABLES `centro_configuracion` WRITE;
/*!40000 ALTER TABLE `centro_configuracion` DISABLE KEYS */;
INSERT INTO `centro_configuracion` VALUES (1,12,'2024-2025','Español','Africa/Malabo','Sobre 10','2026-09-09','2026-07-03 01:21:33','2026-07-03 01:21:33'),(2,13,'2024-2025','Español','Africa/Malabo','Sobre 10','2026-09-06','2026-07-03 02:11:26','2026-07-03 02:11:26');
/*!40000 ALTER TABLE `centro_configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centro_cursos`
--

DROP TABLE IF EXISTS `centro_cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_cursos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centro_id` int NOT NULL,
  `nivel` enum('primaria','secundaria','bachillerato') NOT NULL,
  `curso` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_centro_nivel_curso` (`centro_id`,`nivel`,`curso`),
  CONSTRAINT `fk_cursos_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_cursos`
--

LOCK TABLES `centro_cursos` WRITE;
/*!40000 ALTER TABLE `centro_cursos` DISABLE KEYS */;
INSERT INTO `centro_cursos` VALUES (1,12,'primaria','1° Primaria','2026-07-03 01:21:33'),(2,12,'primaria','2° Primaria','2026-07-03 01:21:33'),(3,12,'primaria','3° Primaria','2026-07-03 01:21:33'),(4,12,'primaria','4º Primaria','2026-07-03 01:21:33'),(5,12,'primaria','5º Primaria','2026-07-03 01:21:33'),(6,12,'primaria','6º Primaria','2026-07-03 01:21:33'),(7,12,'secundaria','1° Esba','2026-07-03 01:21:33'),(8,12,'secundaria','2° Esba','2026-07-03 01:21:33'),(9,12,'secundaria','3° Esba','2026-07-03 01:21:33'),(10,12,'secundaria','4º Esba','2026-07-03 01:21:33'),(11,12,'bachillerato','1° Bach','2026-07-03 01:21:33'),(12,12,'bachillerato','2º Bach','2026-07-03 01:21:33'),(13,13,'secundaria','1° Esba','2026-07-03 02:11:26'),(14,13,'secundaria','2° Esba','2026-07-03 02:11:26'),(15,13,'secundaria','3° Esba','2026-07-03 02:11:26'),(16,13,'secundaria','4º Esba','2026-07-03 02:11:26'),(17,13,'bachillerato','1° Bach','2026-07-03 02:11:26'),(18,13,'bachillerato','2º Bach','2026-07-03 02:11:26'),(19,1,'primaria','1º Primaria','2026-07-04 21:58:30'),(20,1,'primaria','2º Primaria','2026-07-04 21:58:30'),(21,1,'primaria','3º Primaria','2026-07-04 21:58:30'),(22,1,'primaria','4º Primaria','2026-07-04 21:58:30'),(23,1,'primaria','5º Primaria','2026-07-04 21:58:30'),(24,1,'primaria','6º Primaria','2026-07-04 21:58:30'),(25,1,'secundaria','1º Esba','2026-07-04 21:58:30'),(26,1,'secundaria','2º Esba','2026-07-04 21:58:30'),(27,1,'secundaria','3º Esba','2026-07-04 21:58:30'),(28,1,'secundaria','4º Esba','2026-07-04 21:58:30'),(29,1,'bachillerato','1º Bach','2026-07-04 21:58:30'),(30,1,'bachillerato','2º Bach','2026-07-04 21:58:30'),(31,2,'primaria','1º Primaria','2026-07-04 21:58:30'),(32,2,'primaria','2º Primaria','2026-07-04 21:58:30'),(33,2,'primaria','3º Primaria','2026-07-04 21:58:30'),(34,2,'primaria','4º Primaria','2026-07-04 21:58:30'),(35,2,'primaria','5º Primaria','2026-07-04 21:58:30'),(36,2,'primaria','6º Primaria','2026-07-04 21:58:30'),(37,2,'secundaria','1º Esba','2026-07-04 21:58:30'),(38,2,'secundaria','2º Esba','2026-07-04 21:58:30'),(39,2,'secundaria','3º Esba','2026-07-04 21:58:30'),(40,2,'secundaria','4º Esba','2026-07-04 21:58:30'),(41,2,'bachillerato','1º Bach','2026-07-04 21:58:30'),(42,2,'bachillerato','2º Bach','2026-07-04 21:58:30'),(43,3,'primaria','1º Primaria','2026-07-04 21:58:30'),(44,3,'primaria','2º Primaria','2026-07-04 21:58:30'),(45,3,'primaria','3º Primaria','2026-07-04 21:58:30'),(46,3,'primaria','4º Primaria','2026-07-04 21:58:30'),(47,3,'primaria','5º Primaria','2026-07-04 21:58:30'),(48,3,'primaria','6º Primaria','2026-07-04 21:58:30'),(49,3,'secundaria','1º Esba','2026-07-04 21:58:30'),(50,3,'secundaria','2º Esba','2026-07-04 21:58:30'),(51,3,'secundaria','3º Esba','2026-07-04 21:58:30'),(52,3,'secundaria','4º Esba','2026-07-04 21:58:30'),(53,3,'bachillerato','1º Bach','2026-07-04 21:58:30'),(54,3,'bachillerato','2º Bach','2026-07-04 21:58:30'),(55,4,'primaria','1º Primaria','2026-07-04 21:58:30'),(56,4,'primaria','2º Primaria','2026-07-04 21:58:30'),(57,4,'primaria','3º Primaria','2026-07-04 21:58:30'),(58,4,'primaria','4º Primaria','2026-07-04 21:58:30'),(59,4,'primaria','5º Primaria','2026-07-04 21:58:30'),(60,4,'primaria','6º Primaria','2026-07-04 21:58:30'),(61,4,'secundaria','1º Esba','2026-07-04 21:58:30'),(62,4,'secundaria','2º Esba','2026-07-04 21:58:30'),(63,4,'secundaria','3º Esba','2026-07-04 21:58:30'),(64,4,'secundaria','4º Esba','2026-07-04 21:58:30'),(65,4,'bachillerato','1º Bach','2026-07-04 21:58:30'),(66,4,'bachillerato','2º Bach','2026-07-04 21:58:30'),(67,5,'primaria','1º Primaria','2026-07-04 21:58:30'),(68,5,'primaria','2º Primaria','2026-07-04 21:58:30'),(69,5,'primaria','3º Primaria','2026-07-04 21:58:30'),(70,5,'primaria','4º Primaria','2026-07-04 21:58:30'),(71,5,'primaria','5º Primaria','2026-07-04 21:58:30'),(72,5,'primaria','6º Primaria','2026-07-04 21:58:30'),(73,5,'secundaria','1º Esba','2026-07-04 21:58:30'),(74,5,'secundaria','2º Esba','2026-07-04 21:58:30'),(75,5,'secundaria','3º Esba','2026-07-04 21:58:30'),(76,5,'secundaria','4º Esba','2026-07-04 21:58:30'),(77,5,'bachillerato','1º Bach','2026-07-04 21:58:30'),(78,5,'bachillerato','2º Bach','2026-07-04 21:58:30');
/*!40000 ALTER TABLE `centro_cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centro_usuarios`
--

DROP TABLE IF EXISTS `centro_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centro_usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `centro_id` int DEFAULT NULL,
  `rol_en_centro` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `fecha_union` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `curso_id` int DEFAULT NULL,
  `rama_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `centro_id` (`centro_id`),
  KEY `curso_id` (`curso_id`),
  KEY `rama_id` (`rama_id`),
  CONSTRAINT `centro_usuarios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `centro_usuarios_ibfk_2` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`),
  CONSTRAINT `centro_usuarios_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `centro_usuarios_ibfk_4` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`),
  CONSTRAINT `centro_usuarios_ibfk_5` FOREIGN KEY (`curso_id`) REFERENCES `centro_cursos` (`id`),
  CONSTRAINT `centro_usuarios_ibfk_6` FOREIGN KEY (`rama_id`) REFERENCES `ramas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_usuarios`
--

LOCK TABLES `centro_usuarios` WRITE;
/*!40000 ALTER TABLE `centro_usuarios` DISABLE KEYS */;
INSERT INTO `centro_usuarios` VALUES (1,1,1,'profesor',NULL,NULL,NULL,NULL,NULL),(2,2,1,'alumno',NULL,NULL,NULL,NULL,NULL),(3,3,2,'alumno',NULL,NULL,NULL,42,1),(4,4,3,'profesor',NULL,NULL,NULL,NULL,NULL),(5,4,5,'profesor',NULL,NULL,NULL,NULL,NULL),(6,4,1,'profesor',NULL,NULL,NULL,NULL,NULL),(7,1,2,'profesor',NULL,NULL,NULL,NULL,NULL),(8,1,3,'profesor',NULL,NULL,NULL,NULL,NULL),(9,1,4,'profesor',NULL,NULL,NULL,NULL,NULL),(10,4,2,'profesor',NULL,NULL,NULL,NULL,NULL),(11,5,1,'profesor',NULL,NULL,NULL,NULL,NULL),(12,6,3,'alumno',NULL,NULL,NULL,NULL,NULL),(13,7,4,'admin',NULL,NULL,NULL,NULL,NULL),(14,7,2,'admin',NULL,NULL,NULL,NULL,NULL),(15,8,5,'alumno',NULL,NULL,NULL,NULL,NULL),(16,8,1,'profesor',NULL,NULL,NULL,NULL,NULL),(17,9,5,'alumno',NULL,NULL,NULL,NULL,NULL),(18,10,3,'alumno',NULL,NULL,NULL,NULL,NULL),(20,14,12,'admin',NULL,NULL,NULL,NULL,NULL),(21,15,13,'admin',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `centro_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `centros`
--

DROP TABLE IF EXISTS `centros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `tipo_de_centro` varchar(50) NOT NULL DEFAULT 'Colegio',
  `codigo` varchar(255) DEFAULT NULL,
  `direccion` text,
  `ciudad` varchar(255) DEFAULT NULL,
  `pais` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logo` text,
  `estado` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centros`
--

LOCK TABLES `centros` WRITE;
/*!40000 ALTER TABLE `centros` DISABLE KEYS */;
INSERT INTO `centros` VALUES (1,'Colegio Privado Buen Pastor','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'Colegio Claret','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'Colegio Adventista','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Colegio Ewaiso Ipola','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'Colegio Emanuel','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Colegio Maria Cano','Colegio',NULL,'Sampaka','Malabo','Guinea Ecuatorial','+240 222123456','mariacano@gmail.com',NULL,NULL,NULL,NULL),(13,'Ines Aneja Luter King','Instituto','S5184','Calle Rey Bonkoro','Malabo','Guinea Ecuatorial','+240 222284414','aneja@gmail.com',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `centros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curso_asignaturas`
--

DROP TABLE IF EXISTS `curso_asignaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso_asignaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `curso_id` int NOT NULL,
  `asignatura_id` int NOT NULL,
  `rama_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `curso_id` (`curso_id`),
  KEY `asignatura_id` (`asignatura_id`),
  KEY `rama_id` (`rama_id`),
  CONSTRAINT `curso_asignaturas_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `centro_cursos` (`id`),
  CONSTRAINT `curso_asignaturas_ibfk_2` FOREIGN KEY (`asignatura_id`) REFERENCES `asignaturas` (`id`),
  CONSTRAINT `curso_asignaturas_ibfk_3` FOREIGN KEY (`rama_id`) REFERENCES `ramas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso_asignaturas`
--

LOCK TABLES `curso_asignaturas` WRITE;
/*!40000 ALTER TABLE `curso_asignaturas` DISABLE KEYS */;
INSERT INTO `curso_asignaturas` VALUES (1,42,1,NULL),(2,42,2,NULL),(3,42,3,NULL),(4,42,4,NULL),(5,42,5,NULL),(6,42,6,NULL),(7,42,7,NULL),(8,42,8,NULL),(9,42,9,1),(10,42,10,1),(11,42,11,1),(12,42,12,1),(13,42,13,1),(14,42,10,2);
/*!40000 ALTER TABLE `curso_asignaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
INSERT INTO `password_resets` VALUES (3,'pilarndong12@gmail.com','a987b03cedd18f84d55068747489450c6c95acf75ede592c3eafa4b55da4ebee','2026-06-28 22:28:27','2026-06-28 21:28:26'),(4,'christiannsue00@gmail.com','469e63d26f406647e5ec0cc84e172194c6e9188dd18c87795c30baca7bf2da3f','2026-06-30 19:44:24','2026-06-30 18:44:24');
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profesor_asignaturas`
--

DROP TABLE IF EXISTS `profesor_asignaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesor_asignaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centro_usuario_id` int NOT NULL,
  `curso_id` int NOT NULL,
  `asignatura_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `centro_usuario_id` (`centro_usuario_id`),
  KEY `curso_id` (`curso_id`),
  KEY `asignatura_id` (`asignatura_id`),
  CONSTRAINT `profesor_asignaturas_ibfk_1` FOREIGN KEY (`centro_usuario_id`) REFERENCES `centro_usuarios` (`id`),
  CONSTRAINT `profesor_asignaturas_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `centro_cursos` (`id`),
  CONSTRAINT `profesor_asignaturas_ibfk_3` FOREIGN KEY (`asignatura_id`) REFERENCES `asignaturas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesor_asignaturas`
--

LOCK TABLES `profesor_asignaturas` WRITE;
/*!40000 ALTER TABLE `profesor_asignaturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `profesor_asignaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ramas`
--

DROP TABLE IF EXISTS `ramas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ramas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `curso_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `curso_id` (`curso_id`),
  CONSTRAINT `ramas_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `centro_cursos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ramas`
--

LOCK TABLES `ramas` WRITE;
/*!40000 ALTER TABLE `ramas` DISABLE KEYS */;
INSERT INTO `ramas` VALUES (1,'CIENCIAS de la Naturaleza y Salud',42),(2,'Tecnologia',42),(3,'Ciencias Sociales y Humanidades',42);
/*!40000 ALTER TABLE `ramas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `apellidos` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `foto_perfil` text,
  `estado` varchar(255) DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'A001','Deogracias Ondo','Nsue Nzang','deograciasondonsuenzang@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(2,'M001','Benjamin Nsue','Nsue Nzang','benjamin.nsue@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(3,'S001','Eliseo Obama','Nsue Nzang','eliseo.obama@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(4,'C001','Christian','Nsue','christiannsue00@gmail.com','$2b$10$JX6lxFBOeFIdrmBbZMiEQuizaX8Pu3ovDivW3jszD0ujppyF26Pim',NULL,NULL,NULL,NULL,NULL,NULL),(5,'B001','Manuel','Mbela','manuelmbela@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(6,'Z001','Gabriel','Nguema','gabrielnguema@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(7,'P001','Pilar','Ndong','pilarndong12@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(8,'C002','Catherine','Boñao','catherineboñao@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(9,'H001','Hilario','Ndong','hilicristiano@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(10,'J001','Jose','Nguema','josenguema@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(14,'E5947','Cesar Ramon','Robinson Rivas','cesarrivas@gmail.com','$2b$10$upmIzu.xy/YXLp26PzrzIeLMPZrntu3C7/B3vPkQCzNrJ0wlwwPgK','555123456',NULL,NULL,NULL,NULL,NULL),(15,'IAL4602','Christian','Nguba Alais','christiannguba@gmail.com','$2b$10$VOwBW4CLCgRe3TOkENGotOxhkFc5vh2Ma6ZJ9g2bBXZYzSZ9c7bNO','555775766',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 19:34:25

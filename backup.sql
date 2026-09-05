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
-- Table structure for table `actividad_log`
--

DROP TABLE IF EXISTS `actividad_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividad_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centro_id` int NOT NULL,
  `tipo` enum('alumno_registrado','profesor_registrado','asignatura_creada','tarea_publicada') DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `centro_id` (`centro_id`),
  CONSTRAINT `actividad_log_ibfk_1` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_log`
--

LOCK TABLES `actividad_log` WRITE;
/*!40000 ALTER TABLE `actividad_log` DISABLE KEYS */;
INSERT INTO `actividad_log` VALUES (1,2,'tarea_publicada','Nueva tarea publicada','El profesor Christian Nsue publico una nueva tarea en 2º Bach','2026-08-02 14:25:18'),(2,2,'tarea_publicada','Nueva tarea publicada','El profesor Deogracias Ondo Nsue Nzang publico una nueva tarea en 2º Bach','2026-08-04 13:04:01'),(3,2,'alumno_registrado','Nuevo alumno registrado','Maria Soledad Nzang Osa Angue ha sido registrado como alumno','2026-08-12 20:40:55'),(4,2,'profesor_registrado','Profesor añadido al centro','El profesor Gerson Edu Enguru se ha unido al centro','2026-08-12 20:43:47');
/*!40000 ALTER TABLE `actividad_log` ENABLE KEYS */;
UNLOCK TABLES;

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
  `codigo` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `centro_id` (`centro_id`),
  CONSTRAINT `asignaturas_ibfk_1` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaturas`
--

LOCK TABLES `asignaturas` WRITE;
/*!40000 ALTER TABLE `asignaturas` DISABLE KEYS */;
INSERT INTO `asignaturas` VALUES (1,'Literatura',NULL,2,'Lit-2'),(2,'Historia',NULL,2,'His-2'),(3,'Filosofia',NULL,2,'Fil-2'),(4,'Ciencias Naturales',NULL,2,'CN-2'),(5,'Economia',NULL,2,'Eco-2'),(6,'Religion',NULL,2,'Rel-2'),(7,'Frances',NULL,2,'Fran-2'),(8,'Ingles',NULL,2,'Ing-2'),(9,'Matematicas','En esta asignatura aprenderas los conceptos fundamentales de matematicas, aplicadas a la resolucion de problemas en diversas areas.',2,'Mat-2'),(10,'Electrotecnia',NULL,2,'Ele-2'),(11,'Quimica',NULL,2,'Qui-2'),(12,'Fisica',NULL,2,'Fis-2'),(13,'Geologia',NULL,2,'Geo-2'),(14,'Tecnologia Industrial II',NULL,2,'TEC-02'),(15,'Dibujo Tecnico',NULL,2,'DIB-02'),(16,'Matematicas Aplicadas',NULL,2,'MTA-02'),(17,'Historia del Arte',NULL,2,'HIA-02'),(18,'Latin',NULL,2,'LAT-02'),(19,'Griego',NULL,2,'GRI-02');
/*!40000 ALTER TABLE `asignaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `curso_asignatura_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','justificado') NOT NULL DEFAULT 'presente',
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_asistencia` (`curso_asignatura_id`,`usuario_id`,`fecha`),
  KEY `curso_asignatura_id` (`curso_asignatura_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`curso_asignatura_id`) REFERENCES `curso_asignaturas` (`id`),
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (1,9,3,'2026-07-13','presente',NULL),(2,9,16,'2026-07-13','presente',NULL),(3,9,3,'2026-07-01','presente',NULL),(4,9,16,'2026-07-01','presente',NULL),(5,9,3,'2026-07-02','ausente',NULL),(6,9,16,'2026-07-02','presente',NULL),(7,9,3,'2026-07-03','presente',NULL),(8,9,16,'2026-07-03','justificado',NULL),(9,9,3,'2026-07-06','presente',NULL),(10,9,16,'2026-07-06','presente',NULL),(11,9,3,'2026-07-07','presente',NULL),(12,9,16,'2026-07-07','presente',NULL),(13,3,20,'2026-07-17','ausente',NULL),(14,3,3,'2026-07-17','justificado',NULL),(15,3,18,'2026-07-17','presente',NULL),(16,3,16,'2026-07-17','presente',NULL),(17,3,17,'2026-07-17','presente',NULL),(18,3,19,'2026-07-17','presente',NULL),(19,3,20,'2026-07-15','presente',NULL),(20,3,3,'2026-07-15','presente',NULL),(21,3,18,'2026-07-15','presente',NULL),(22,3,16,'2026-07-15','presente',NULL),(23,3,17,'2026-07-15','presente',NULL),(24,3,19,'2026-07-15','presente',NULL),(25,3,20,'2026-07-16','presente',NULL),(26,3,3,'2026-07-16','presente',NULL),(27,3,18,'2026-07-16','presente',NULL),(28,3,16,'2026-07-16','presente',NULL),(29,3,17,'2026-07-16','presente',NULL),(30,3,19,'2026-07-16','presente',NULL),(31,9,3,'2026-07-20','presente',NULL),(32,9,16,'2026-07-20','justificado',NULL),(33,9,3,'2026-07-21','presente',NULL),(34,9,16,'2026-07-21','presente',NULL),(35,21,18,'2026-07-15','presente',NULL),(36,21,17,'2026-07-15','presente',NULL),(37,21,18,'2026-07-16','presente',NULL),(38,21,17,'2026-07-16','presente',NULL),(39,21,18,'2026-07-17','presente',NULL),(40,21,17,'2026-07-17','ausente',NULL),(41,21,18,'2026-07-06','presente',NULL),(42,21,17,'2026-07-06','presente',NULL),(43,21,18,'2026-07-07','presente',NULL),(44,21,17,'2026-07-07','presente',NULL),(45,21,18,'2026-07-08','presente',NULL),(46,21,17,'2026-07-08','presente',NULL),(47,21,18,'2026-07-09','ausente',NULL),(48,21,17,'2026-07-09','presente',NULL),(49,21,18,'2026-07-10','presente',NULL),(50,21,17,'2026-07-10','presente',NULL),(51,11,3,'2026-07-06','presente',NULL),(52,11,16,'2026-07-06','presente',NULL),(53,11,3,'2026-07-07','presente',NULL),(54,11,16,'2026-07-07','presente',NULL),(55,11,3,'2026-07-08','presente',NULL),(56,11,16,'2026-07-08','presente',NULL),(57,11,3,'2026-07-09','presente',NULL),(58,11,16,'2026-07-09','presente',NULL),(59,11,3,'2026-07-10','ausente',NULL),(60,11,16,'2026-07-10','presente',NULL),(61,11,3,'2026-07-13','presente',NULL),(62,11,16,'2026-07-13','ausente',NULL),(63,11,3,'2026-07-14','presente',NULL),(64,11,16,'2026-07-14','presente',NULL),(65,11,3,'2026-07-15','presente',NULL),(66,11,16,'2026-07-15','presente',NULL),(67,11,3,'2026-07-16','presente',NULL),(68,11,16,'2026-07-16','presente',NULL),(69,11,3,'2026-07-17','presente',NULL),(70,11,16,'2026-07-17','presente',NULL),(71,9,3,'2026-08-06','presente',NULL),(72,9,16,'2026-08-06','presente',NULL);
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
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
  `idioma_sistema` varchar(10) NOT NULL DEFAULT 'Español',
  `zona_horaria` varchar(30) NOT NULL DEFAULT 'Africa/Malabo',
  `sistema_calificacion` varchar(10) NOT NULL DEFAULT 'Sobre 10',
  `inicio_ano_academico` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_centro_config` (`centro_id`),
  CONSTRAINT `fk_config_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_configuracion`
--

LOCK TABLES `centro_configuracion` WRITE;
/*!40000 ALTER TABLE `centro_configuracion` DISABLE KEYS */;
INSERT INTO `centro_configuracion` VALUES (1,12,'2024-2025','Español','Africa/Malabo','Sobre 10','2026-09-09','2026-07-03 01:21:33','2026-07-03 01:21:33'),(2,13,'2024-2025','Español','Africa/Malabo','Sobre 10','2026-09-06','2026-07-03 02:11:26','2026-07-03 02:11:26'),(3,14,'2026-2027','Español','Africa/Douala','Sobre 10','2026-09-09','2026-07-17 18:11:09','2026-07-17 18:11:09'),(4,15,'2026-2027','Español','Africa/Malabo','Sobre 100','2026-09-06','2026-07-17 18:31:53','2026-07-17 18:31:53'),(5,2,'2026-2027','Español','Africa/Malabo','Sobre 10','2026-09-08','2026-08-10 18:56:30','2026-08-10 20:06:47');
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
  `curso` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tutor_id` int DEFAULT NULL,
  `grupo` varchar(10) DEFAULT NULL,
  `rama_id` int DEFAULT NULL,
  `curso_base` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_centro_nivel_curso` (`centro_id`,`nivel`,`curso`),
  KEY `centro_cursos_ibfk_tutor` (`tutor_id`),
  KEY `centro_cursos_ibfk_rama` (`rama_id`),
  CONSTRAINT `centro_cursos_ibfk_rama` FOREIGN KEY (`rama_id`) REFERENCES `ramas` (`id`),
  CONSTRAINT `centro_cursos_ibfk_tutor` FOREIGN KEY (`tutor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_cursos_centro` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_cursos`
--

LOCK TABLES `centro_cursos` WRITE;
/*!40000 ALTER TABLE `centro_cursos` DISABLE KEYS */;
INSERT INTO `centro_cursos` VALUES (1,12,'primaria','1° Primaria','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(2,12,'primaria','2° Primaria','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(3,12,'primaria','3° Primaria','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(4,12,'primaria','4º Primaria','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(5,12,'primaria','5º Primaria','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(6,12,'primaria','6º Primaria','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(7,12,'secundaria','1° Esba','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(8,12,'secundaria','2° Esba','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(9,12,'secundaria','3° Esba','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(10,12,'secundaria','4º Esba','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(11,12,'bachillerato','1° Bach','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(12,12,'bachillerato','2º Bach','2026-07-03 01:21:33',NULL,NULL,NULL,NULL),(13,13,'secundaria','1° Esba','2026-07-03 02:11:26',NULL,NULL,NULL,NULL),(14,13,'secundaria','2° Esba','2026-07-03 02:11:26',NULL,NULL,NULL,NULL),(15,13,'secundaria','3° Esba','2026-07-03 02:11:26',NULL,NULL,NULL,NULL),(16,13,'secundaria','4º Esba','2026-07-03 02:11:26',NULL,NULL,NULL,NULL),(17,13,'bachillerato','1° Bach','2026-07-03 02:11:26',NULL,NULL,NULL,NULL),(18,13,'bachillerato','2º Bach','2026-07-03 02:11:26',NULL,NULL,NULL,NULL),(19,1,'primaria','1º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(20,1,'primaria','2º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(21,1,'primaria','3º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(22,1,'primaria','4º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(23,1,'primaria','5º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(24,1,'primaria','6º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(25,1,'secundaria','1º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(26,1,'secundaria','2º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(27,1,'secundaria','3º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(28,1,'secundaria','4º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(29,1,'bachillerato','1º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(30,1,'bachillerato','2º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(41,2,'bachillerato','1º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,'1º Bachillerato'),(42,2,'bachillerato','2º Bach','2026-07-04 21:58:30',4,NULL,NULL,'2º Bachillerato'),(43,3,'primaria','1º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(44,3,'primaria','2º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(45,3,'primaria','3º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(46,3,'primaria','4º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(47,3,'primaria','5º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(48,3,'primaria','6º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(49,3,'secundaria','1º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(50,3,'secundaria','2º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(51,3,'secundaria','3º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(52,3,'secundaria','4º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(53,3,'bachillerato','1º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(54,3,'bachillerato','2º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(55,4,'primaria','1º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(56,4,'primaria','2º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(57,4,'primaria','3º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(58,4,'primaria','4º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(59,4,'primaria','5º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(60,4,'primaria','6º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(61,4,'secundaria','1º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(62,4,'secundaria','2º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(63,4,'secundaria','3º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(64,4,'secundaria','4º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(65,4,'bachillerato','1º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(66,4,'bachillerato','2º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(67,5,'primaria','1º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(68,5,'primaria','2º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(69,5,'primaria','3º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(70,5,'primaria','4º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(71,5,'primaria','5º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(72,5,'primaria','6º Primaria','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(73,5,'secundaria','1º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(74,5,'secundaria','2º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(75,5,'secundaria','3º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(76,5,'secundaria','4º Esba','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(77,5,'bachillerato','1º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(78,5,'bachillerato','2º Bach','2026-07-04 21:58:30',NULL,NULL,NULL,NULL),(79,14,'primaria','1° Primaria','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(80,14,'primaria','2° Primaria','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(81,14,'primaria','3° Primaria','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(82,14,'primaria','4º Primaria','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(83,14,'primaria','5º Primaria','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(84,14,'primaria','6º Primaria','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(85,14,'secundaria','1° Esba','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(86,14,'secundaria','2° Esba','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(87,14,'secundaria','3° Esba','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(88,14,'secundaria','4º Esba','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(89,14,'bachillerato','1° Bach','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(90,14,'bachillerato','2º Bach','2026-07-17 18:11:09',NULL,NULL,NULL,NULL),(91,15,'primaria','1° Primaria','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(92,15,'primaria','2° Primaria','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(93,15,'primaria','3° Primaria','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(94,15,'secundaria','1° Esba','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(95,15,'secundaria','2° Esba','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(96,15,'secundaria','3° Esba','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(97,15,'bachillerato','1° Bach','2026-07-17 18:31:53',NULL,NULL,NULL,NULL),(98,2,'bachillerato','1º Bachillerato - Ciencias de la Naturaleza y salud - Grupo A','2026-08-15 16:30:07',NULL,'A',1,'1º Bachillerato'),(99,2,'primaria','1º Primaria','2026-08-20 14:46:27',NULL,NULL,NULL,'1º Primaria'),(100,2,'secundaria','1º ESBA','2026-08-20 14:46:50',NULL,NULL,NULL,'1º ESBA');
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
  `estado` varchar(25) NOT NULL DEFAULT 'activo',
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centro_usuarios`
--

LOCK TABLES `centro_usuarios` WRITE;
/*!40000 ALTER TABLE `centro_usuarios` DISABLE KEYS */;
INSERT INTO `centro_usuarios` VALUES (1,1,1,'profesor','activo',NULL,NULL,NULL,NULL),(2,2,1,'alumno','activo',NULL,NULL,NULL,NULL),(3,3,2,'alumno','activo',NULL,NULL,42,1),(4,4,3,'profesor','activo',NULL,NULL,NULL,NULL),(5,4,5,'profesor','activo',NULL,NULL,NULL,NULL),(6,4,1,'profesor','activo',NULL,NULL,NULL,NULL),(7,1,2,'profesor','activo',NULL,NULL,NULL,NULL),(8,1,3,'profesor','activo',NULL,NULL,NULL,NULL),(9,1,4,'profesor','activo',NULL,NULL,NULL,NULL),(10,4,2,'profesor','activo',NULL,NULL,NULL,NULL),(11,5,1,'profesor','activo',NULL,NULL,NULL,NULL),(12,6,3,'alumno','activo',NULL,NULL,NULL,NULL),(13,7,4,'admin','activo',NULL,NULL,NULL,NULL),(14,7,2,'admin','activo',NULL,NULL,NULL,NULL),(15,8,5,'alumno','activo',NULL,NULL,NULL,NULL),(16,8,1,'profesor','activo',NULL,NULL,NULL,NULL),(17,9,5,'alumno','activo',NULL,NULL,NULL,NULL),(18,10,3,'alumno','activo',NULL,NULL,NULL,NULL),(20,14,12,'admin','activo',NULL,NULL,NULL,NULL),(21,15,13,'admin','activo',NULL,NULL,NULL,NULL),(22,16,2,'alumno','activo',NULL,NULL,42,1),(23,17,2,'alumno','activo',NULL,NULL,42,2),(24,18,2,'alumno','activo',NULL,NULL,42,2),(25,19,2,'alumno','activo',NULL,NULL,42,3),(26,20,2,'alumno','activo',NULL,NULL,42,3),(27,21,14,'admin','activo',NULL,NULL,NULL,NULL),(28,22,15,'admin','activo',NULL,NULL,NULL,NULL),(29,2,2,'alumno','activo',NULL,NULL,42,1),(30,23,2,'alumno','activo',NULL,NULL,42,1),(31,24,2,'alumno','activo',NULL,NULL,41,NULL),(32,8,2,'profesor','activo',NULL,NULL,NULL,NULL),(34,26,2,'alumno','activo',NULL,NULL,42,1),(35,25,2,'profesor','activo',NULL,NULL,NULL,NULL);
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
  `estado` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `director` varchar(150) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `centros`
--

LOCK TABLES `centros` WRITE;
/*!40000 ALTER TABLE `centros` DISABLE KEYS */;
INSERT INTO `centros` VALUES (1,'Colegio Privado Buen Pastor','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'Colegio Claret','Colegio',NULL,'Calle acacio lumumba, al lado de ministerio de sanidad',NULL,NULL,'222987654','colegio.claret@gmail.com',NULL,NULL,NULL,NULL,'Mariano Ndong Edjang Afang','https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/logos-centros/2-1786390437473-claret.jpg'),(3,'Colegio Adventista','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Colegio Ewaiso Ipola','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'Colegio Emanuel','Colegio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Colegio Maria Cano','Colegio',NULL,'Sampaka','Malabo','Guinea Ecuatorial','+240 222123456','mariacano@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL),(13,'Ines Aneja Luter King','Instituto','S5184','Calle Rey Bonkoro','Malabo','Guinea Ecuatorial','+240 222284414','aneja@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL),(14,'La Salle','Colegio','A2777','Colacesga, Bata','Bata','Guinea Ecuatorial','+240 222707378','lasalle@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL),(15,'Argentina','Instituto','K3961','Argentina, Malabo','Malabo','Guinea Ecuatorial','+240 222984658','argentina.malabo@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso_asignaturas`
--

LOCK TABLES `curso_asignaturas` WRITE;
/*!40000 ALTER TABLE `curso_asignaturas` DISABLE KEYS */;
INSERT INTO `curso_asignaturas` VALUES (1,42,1,NULL),(2,42,2,NULL),(3,42,3,NULL),(4,42,4,NULL),(5,42,5,NULL),(6,42,6,NULL),(7,42,7,NULL),(8,42,8,NULL),(9,42,9,1),(10,42,10,1),(11,42,11,1),(12,42,12,1),(13,42,13,1),(14,42,10,2),(15,42,14,2),(16,42,15,2),(17,42,16,3),(18,42,17,3),(19,42,18,3),(20,42,19,3),(21,42,9,2);
/*!40000 ALTER TABLE `curso_asignaturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horario_clases`
--

DROP TABLE IF EXISTS `horario_clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario_clases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('clase','refuerzo','tutoria') NOT NULL DEFAULT 'clase',
  `dia_semana` tinyint NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `curso_asignatura_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `horario_clases_ibfk_ca` (`curso_asignatura_id`),
  CONSTRAINT `horario_clases_ibfk_ca` FOREIGN KEY (`curso_asignatura_id`) REFERENCES `curso_asignaturas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horario_clases`
--

LOCK TABLES `horario_clases` WRITE;
/*!40000 ALTER TABLE `horario_clases` DISABLE KEYS */;
INSERT INTO `horario_clases` VALUES (63,'clase',1,'13:10:00','14:00:00',1),(64,'clase',2,'13:10:00','14:00:00',1),(65,'clase',3,'13:10:00','14:00:00',1),(66,'clase',4,'13:10:00','14:00:00',1),(67,'clase',5,'13:10:00','14:00:00',9),(68,'clase',1,'14:00:00','14:50:00',9),(69,'clase',1,'14:50:00','15:40:00',5),(70,'clase',2,'14:00:00','14:50:00',9),(71,'clase',3,'14:00:00','14:50:00',9),(72,'clase',4,'14:00:00','14:50:00',10),(73,'clase',5,'14:00:00','14:50:00',5),(74,'clase',2,'14:50:00','15:40:00',4),(75,'clase',3,'14:50:00','15:40:00',3),(76,'clase',4,'14:50:00','15:40:00',12),(77,'clase',5,'14:50:00','15:40:00',11),(78,'clase',1,'16:10:00','17:00:00',12),(79,'clase',2,'16:10:00','17:00:00',12),(80,'clase',3,'16:10:00','17:00:00',11),(81,'clase',4,'16:10:00','17:00:00',11),(82,'clase',5,'16:10:00','17:00:00',10),(83,'clase',1,'17:00:00','17:50:00',11),(84,'clase',2,'17:00:00','17:50:00',4),(85,'clase',3,'17:00:00','17:50:00',7),(86,'clase',4,'17:00:00','17:50:00',3),(87,'clase',5,'17:00:00','17:50:00',4),(88,'clase',1,'17:50:00','18:40:00',7),(89,'clase',2,'17:50:00','18:40:00',8),(90,'clase',3,'17:50:00','18:40:00',13),(91,'clase',4,'17:50:00','18:40:00',6),(92,'clase',5,'17:50:00','18:40:00',8);
/*!40000 ALTER TABLE `horario_clases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horario_descansos`
--

DROP TABLE IF EXISTS `horario_descansos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario_descansos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `centro_id` int NOT NULL,
  `nombre` varchar(50) NOT NULL DEFAULT 'Recreo',
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `centro_id` (`centro_id`),
  CONSTRAINT `horario_descansos_ibfk_1` FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horario_descansos`
--

LOCK TABLES `horario_descansos` WRITE;
/*!40000 ALTER TABLE `horario_descansos` DISABLE KEYS */;
INSERT INTO `horario_descansos` VALUES (1,2,'Recreo','15:40:00','16:10:00');
/*!40000 ALTER TABLE `horario_descansos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_carpetas`
--

DROP TABLE IF EXISTS `material_carpetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_carpetas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `curso_asignatura_id` int NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `curso_asignatura_id` (`curso_asignatura_id`),
  CONSTRAINT `material_carpetas_ibfk_1` FOREIGN KEY (`curso_asignatura_id`) REFERENCES `curso_asignaturas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_carpetas`
--

LOCK TABLES `material_carpetas` WRITE;
/*!40000 ALTER TABLE `material_carpetas` DISABLE KEYS */;
INSERT INTO `material_carpetas` VALUES (1,9,'Unidad 1: Los Numeros','2026-07-19 15:51:41');
/*!40000 ALTER TABLE `material_carpetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materiales`
--

DROP TABLE IF EXISTS `materiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `curso_asignatura_id` int NOT NULL,
  `carpeta_id` int DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `extension` varchar(10) NOT NULL,
  `archivo_url` varchar(500) NOT NULL,
  `tamano_bytes` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `curso_asignatura_id` (`curso_asignatura_id`),
  KEY `carpeta_id` (`carpeta_id`),
  CONSTRAINT `materiales_ibfk_1` FOREIGN KEY (`curso_asignatura_id`) REFERENCES `curso_asignaturas` (`id`),
  CONSTRAINT `materiales_ibfk_2` FOREIGN KEY (`carpeta_id`) REFERENCES `material_carpetas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materiales`
--

LOCK TABLES `materiales` WRITE;
/*!40000 ALTER TABLE `materiales` DISABLE KEYS */;
INSERT INTO `materiales` VALUES (1,9,1,'Tema 1: Los numeros reales.pdf','pdf','https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/materiales/1784473446944-Tema_1_Numeros_reales.pdf',65801,'2026-07-19 16:04:10');
/*!40000 ALTER TABLE `materiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo` enum('tarea_publicada','tarea_calificada','material_publicado','tarea_entregada','alumno_registrado','alumno_removido','profesor_registrado','asignatura_creada','asignatura_editada','profesor_asignado','profesor_removido','curso_creado','curso_editado','horario_editado','password_reset','calificaciones_registradas','anuncio_publicado') NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` varchar(500) NOT NULL,
  `enlace` varchar(255) DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,4,'tarea_entregada','Nueva entrega recibida','Eliseo Obama Nsue Nzang ha entregado la tarea \"Ecuaciones bicuadradas\".','http://localhost:5173/profesor/tareas/25',1,'2026-07-27 22:23:15'),(2,3,'tarea_calificada','Tarea calificada','Tu tarea \"Ecuaciones bicuadradas\" ha sido calificada con 10.','http://localhost:5173/alumno/tareas/25',1,'2026-07-27 22:26:20'),(3,3,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Ecuaciones redox\" en Quimica. Fecha limite: 2026-09-01.','http://localhost:5173/alumno/tareas/27',1,'2026-08-02 14:01:42'),(4,16,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Ecuaciones redox\" en Quimica. Fecha limite: 2026-09-01.','http://localhost:5173/alumno/tareas/27',0,'2026-08-02 14:01:42'),(5,3,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Ejercicios de densidad y volumen\" en Fisica. Fecha limite: 2026-09-08.','http://localhost:5173/alumno/tareas/28',1,'2026-08-02 14:25:18'),(6,16,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Ejercicios de densidad y volumen\" en Fisica. Fecha limite: 2026-09-08.','http://localhost:5173/alumno/tareas/28',0,'2026-08-02 14:25:18'),(7,3,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Vida de Socrates\" en Filosofia. Fecha limite: 2026-09-16.','http://localhost:5173/alumno/tareas/29',1,'2026-08-04 13:04:01'),(8,16,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Vida de Socrates\" en Filosofia. Fecha limite: 2026-09-16.','http://localhost:5173/alumno/tareas/29',0,'2026-08-04 13:04:01'),(9,19,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Vida de Socrates\" en Filosofia. Fecha limite: 2026-09-16.','http://localhost:5173/alumno/tareas/29',0,'2026-08-04 13:04:01'),(10,18,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Vida de Socrates\" en Filosofia. Fecha limite: 2026-09-16.','http://localhost:5173/alumno/tareas/29',0,'2026-08-04 13:04:01'),(11,17,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Vida de Socrates\" en Filosofia. Fecha limite: 2026-09-16.','http://localhost:5173/alumno/tareas/29',0,'2026-08-04 13:04:01'),(12,20,'tarea_publicada','Nueva tarea publicada','Se ha publicado la tarea \"Vida de Socrates\" en Filosofia. Fecha limite: 2026-09-16.','http://localhost:5173/alumno/tareas/29',0,'2026-08-04 13:04:01'),(13,4,'tarea_entregada','Nueva entrega recibida','Eliseo Obama Nsue Nzang ha entregado la tarea \"Derivadas y diferenciales\".','http://localhost:5173/profesor/tareas/26',1,'2026-08-06 02:15:14'),(14,3,'tarea_calificada','Tarea calificada','Tu tarea \"Derivadas y diferenciales\" ha sido calificada con 4.5.','http://localhost:5173/alumno/tareas/26',1,'2026-08-06 02:17:26');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
INSERT INTO `password_resets` VALUES (3,'pilarndong12@gmail.com','a987b03cedd18f84d55068747489450c6c95acf75ede592c3eafa4b55da4ebee','2026-06-28 22:28:27','2026-06-28 21:28:26');
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
  `curso_asignatura_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `centro_usuario_id` (`centro_usuario_id`),
  KEY `profesor_asignaturas_ibfk_ca` (`curso_asignatura_id`),
  CONSTRAINT `profesor_asignaturas_ibfk_1` FOREIGN KEY (`centro_usuario_id`) REFERENCES `centro_usuarios` (`id`),
  CONSTRAINT `profesor_asignaturas_ibfk_ca` FOREIGN KEY (`curso_asignatura_id`) REFERENCES `curso_asignaturas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesor_asignaturas`
--

LOCK TABLES `profesor_asignaturas` WRITE;
/*!40000 ALTER TABLE `profesor_asignaturas` DISABLE KEYS */;
INSERT INTO `profesor_asignaturas` VALUES (1,7,3),(2,7,10),(3,7,14),(4,10,9),(5,10,11),(6,10,12),(7,10,21),(8,32,2),(9,32,8),(10,32,5),(13,35,15);
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
INSERT INTO `ramas` VALUES (1,'Ciencias de la Naturaleza y salud',42),(2,'Tecnologia',42),(3,'Ciencias Sociales y Humanidades',42);
/*!40000 ALTER TABLE `ramas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarea_entregas`
--

DROP TABLE IF EXISTS `tarea_entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarea_entregas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tarea_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `estado` enum('pendiente','entregada','calificada') NOT NULL DEFAULT 'pendiente',
  `fecha_entrega_real` datetime DEFAULT NULL,
  `nota` varchar(10) DEFAULT NULL,
  `archivo_url` varchar(500) DEFAULT NULL,
  `archivo_nombre` varchar(255) DEFAULT NULL,
  `archivo_tamano` int DEFAULT NULL,
  `comentario` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_tarea_usuario` (`tarea_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `tarea_entregas_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`),
  CONSTRAINT `tarea_entregas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarea_entregas`
--

LOCK TABLES `tarea_entregas` WRITE;
/*!40000 ALTER TABLE `tarea_entregas` DISABLE KEYS */;
INSERT INTO `tarea_entregas` VALUES (1,18,3,'calificada','2026-07-11 23:18:38','7.5',NULL,NULL,NULL,NULL),(2,22,3,'calificada','2026-07-20 23:18:38','7.8',NULL,NULL,NULL,NULL),(3,2,3,'calificada','2026-07-23 17:18:38','8.0',NULL,NULL,NULL,NULL),(4,1,3,'calificada','2026-07-25 20:10:38','8.5',NULL,NULL,NULL,'Tienes buen dominio de las integrales pero te falta por mejorar en las definidas has fallado en el ejercicio numero 5.'),(5,18,16,'calificada',NULL,'7.5',NULL,NULL,NULL,NULL),(6,22,16,'calificada',NULL,'8.0',NULL,NULL,NULL,NULL),(7,2,16,'calificada',NULL,'7.8',NULL,NULL,NULL,NULL),(8,1,16,'calificada',NULL,'8.9',NULL,NULL,NULL,NULL),(9,5,3,'calificada','2026-07-21 23:18:38','9.2',NULL,NULL,NULL,NULL),(10,7,3,'calificada','2026-07-10 22:18:38','7.8',NULL,NULL,NULL,NULL),(11,5,16,'calificada',NULL,'7.5',NULL,NULL,NULL,NULL),(12,7,16,'calificada',NULL,'8.0',NULL,NULL,NULL,NULL),(22,24,3,'calificada','2026-07-26 23:04:40','9.5','https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/entregas-alumnos/24-3-1785103475580-practicas.pdf','practicas.pdf',60606,'Muy buen concepto de las ponderaciones, enhorabuena sigue asi.'),(24,25,3,'calificada','2026-07-27 22:23:15','10','https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/entregas-alumnos/25-3-1785187388752-Carreras_y_Tafunell-La_depresion_de_los_30_en_Espana.pdf','Carreras_y_Tafunell-La_depresion_de_los_30_en_Espana.pdf',288441,'Bien hecho, buen trabajo'),(26,26,3,'calificada','2026-08-06 02:15:14','4.5','https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/entregas-alumnos/26-3-1785978910094-Deogracias.pdf','Deogracias.pdf',271305,'Tienes que mejorar');
/*!40000 ALTER TABLE `tarea_entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text,
  `fecha_entrega` date NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `curso_asignatura_id` int NOT NULL,
  `archivo_url` varchar(500) DEFAULT NULL,
  `archivo_nombre` varchar(255) DEFAULT NULL,
  `instrucciones` text,
  PRIMARY KEY (`id`),
  KEY `tareas_ibfk_ca` (`curso_asignatura_id`),
  CONSTRAINT `tareas_ibfk_ca` FOREIGN KEY (`curso_asignatura_id`) REFERENCES `curso_asignaturas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
INSERT INTO `tareas` VALUES (1,'Ejercicios de integrales','Resuelve estos ejercicios de integrales','2026-08-15','2026-07-10 18:12:51',9,NULL,NULL,NULL),(2,'Ejercicios de derivadas','Resuelve estos ejercicios de derivadas','2026-08-10','2026-07-10 18:12:51',9,NULL,NULL,NULL),(3,'Ejercicios de integrales','Resuelve estos ejercicios de integrales','2026-08-15','2026-07-10 18:12:51',21,NULL,NULL,NULL),(4,'Ejercicios de derivadas','Resuelve estos ejercicios de derivadas','2026-08-10','2026-07-10 18:12:51',21,NULL,NULL,NULL),(5,'Ejercicios de corriente alterna','Resuelve estos ejercicios de corriente alterna','2026-07-25','2026-07-10 18:12:51',10,NULL,NULL,NULL),(6,'Ejercicios de corriente alterna','Resuelve estos ejercicios de corriente alterna','2026-07-25','2026-07-10 18:12:51',14,NULL,NULL,NULL),(7,'Ejercicios de MRU','Resuelve estos ejercicios de movimiento rectilineo uniforme','2026-07-10','2026-07-10 18:12:51',12,NULL,NULL,NULL),(8,'Resumen de motores','Investiga los diferentes tipos de motores que existen','2026-07-03','2026-07-10 18:12:51',15,NULL,NULL,NULL),(9,'Obras de Platon','Investiga la obra de el Mito de las Cabernas de Platon','2026-08-03','2026-07-10 18:12:51',3,NULL,NULL,NULL),(10,'Primera Guerra Mundial','Investiga las causas de la Primera Guerra Mundial','2026-08-30','2026-07-10 18:12:51',2,NULL,NULL,NULL),(11,'Diferencias entre artes','Investiga las direfencias entre el arte contemporaneo y el medieval','2026-06-30','2026-07-10 18:12:51',18,NULL,NULL,NULL),(12,'Ecuaciones','Resuelve estas ecuaciones de segundo grado','2026-07-28','2026-07-10 18:12:51',17,NULL,NULL,NULL),(13,'Ejercicios de velocidad de la luz','Resuelve estos ejercicios de velocidad de la luz','2026-07-30','2026-07-11 21:35:48',12,NULL,NULL,NULL),(14,'Estequiometria','Resuelve estos compuestos quimicos y su estequiometria','2026-08-05','2026-07-11 21:46:36',11,NULL,NULL,NULL),(15,'Alcoholes','Investiga sobre los alcoholes y como son sus compuestos','2026-08-03','2026-07-11 21:49:01',11,NULL,NULL,NULL),(16,'Matrices','Resuelve estos ejercicios de suma, resta, multiplicacion y division de matrices','2026-08-08','2026-07-11 21:51:27',21,NULL,NULL,NULL),(17,'Potencia','Resuelve estos ejercicios de potencia','2026-08-20','2026-07-11 21:55:13',12,NULL,NULL,NULL),(18,'Limites','Resuelve estos ejercicios de limites como aprendimos en clase','2026-07-11','2026-07-11 21:57:43',9,NULL,NULL,NULL),(19,'Presocraticos','Investigas las escuelas presocraticas y cuales fueron sus ideales','2026-07-10','2026-07-12 16:18:02',3,NULL,NULL,NULL),(20,'Motores asincronos','Investiga sobre los motores asincronos','2026-07-15','2026-07-12 16:21:08',14,NULL,NULL,NULL),(21,'Energia','Investiga sobre los diferentes tipos de energia que existen','2026-08-05','2026-07-12 16:24:10',10,NULL,NULL,NULL),(22,'Ecuaciones de segundo grado','Resuelve estas ecuaciones de segundo grado','2026-08-06','2026-07-15 17:27:26',9,'https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/tareas/1784132844940-Ejercicios.docx','Ejercicios.docx','Lee cuidadosamente cada ejercicio.\r\nResuelve y muestra todos los pasos.\r\nEntrega en formato pdf o imagen clara.'),(23,'Trigonometria','Resuelve estos ejercicios de trigonometria','2026-08-13','2026-07-16 12:36:27',9,NULL,NULL,NULL),(24,'Ponderaciones','Resuelve estos ejercicios de ponderaciones','2026-07-27','2026-07-16 12:58:05',9,NULL,NULL,NULL),(25,'Ecuaciones bicuadradas','Resuelve estas ecuaciones bicuadradas','2026-08-05','2026-07-16 13:18:34',9,NULL,NULL,NULL),(26,'Derivadas y diferenciales','Resuelve estos ejercicios de derivadas y diferenciales siguiendo las reglas aprendidas en clase.','2026-08-07','2026-07-26 02:01:40',9,NULL,NULL,'Lee cuidadosamente cada ejercicio.\r\nResuelve como aprendiste en clase.\r\nentrega el ejercicio en pdf o imagen clara'),(27,'Ecuaciones redox','Resuelve estas ecuaciones de redox','2026-09-01','2026-08-02 14:01:41',11,NULL,NULL,'Lee cuidadosamente cada ecuacion\r\nResuelve las ecuaciones redox'),(28,'Ejercicios de densidad y volumen','Resuelve estos ejercicios de densidad y volumen','2026-09-08','2026-08-02 14:25:18',12,NULL,NULL,'Lee cuidadosamente cada ejercicio'),(29,'Vida de Socrates','Investiga la vida de Socrates y sus obras','2026-09-16','2026-08-04 13:04:01',3,NULL,NULL,'Investiga todas las obras de Socrates');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
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
  `estado` varchar(255) DEFAULT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `foto_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'A001','Deogracias Ondo','Nsue Nzang','deograciasondonsuenzang@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG','555775766',NULL,NULL,NULL,NULL,'https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/avatars/1-1784483151619-16.jpg'),(2,'M001','Benjamin Nsue','Nsue Nzang','benjamin.nsue@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(3,'S001','Eliseo Obama','Nsue Nzang','eliseo.obama@gmail.com','$2b$10$vrlHGD5GMG2/YpCA8H0rrOeKiUDNiaO4kvbMgVJJeYU3lmkhu0dra','+240222179314',NULL,NULL,NULL,NULL,'https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/avatars/3-1785173929051-eliseo.JPG'),(4,'C001','Christian','Nsue','christiannsue00@gmail.com','$2b$10$Lo8GnnKp6TDVrq6xuq9xJOd5DRo.JRGXPn188Iw54j1rCn/IyAUcO','+240222783320',NULL,NULL,NULL,NULL,'https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/avatars/4-1784468056810-6.jpg'),(5,'B001','Manuel','Mbela','manuelmbela@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(6,'Z001','Gabriel','Nguema','gabrielnguema@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(7,'P001','Maria Pilar Gregoria Ndong','Abaga Avomo','pilarndong12@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG','222456783',NULL,NULL,NULL,NULL,'https://luhpbawdchmwmfgecrlr.supabase.co/storage/v1/object/public/avatars/7-1786386042393-pilar.JPG'),(8,'C002','Catherine','Boñao','catherineboñao@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(9,'H001','Hilario','Ndong','hilicristiano@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(10,'J001','Jose','Nguema','josenguema@gmail.com','$2b$10$gy3Jlose16nrvhS8RfI0t.XZ5f57OOFekwvzDWnchjmk/iY4ZWWvG',NULL,NULL,NULL,NULL,NULL,NULL),(14,'E5947','Cesar Ramon','Robinson Rivas','cesarrivas@gmail.com','$2b$10$upmIzu.xy/YXLp26PzrzIeLMPZrntu3C7/B3vPkQCzNrJ0wlwwPgK','555123456',NULL,NULL,NULL,NULL,NULL),(15,'IAL4602','Christian','Nguba Alais','christiannguba@gmail.com','$2b$10$VOwBW4CLCgRe3TOkENGotOxhkFc5vh2Ma6ZJ9g2bBXZYzSZ9c7bNO','555775766',NULL,NULL,NULL,NULL,NULL),(16,'CC0912','Jose Antonio','Oyono Abang','jose.antonio@gmail.com','$2b$10$4bMd9SzbEX6WUmMsXVcr6.YiUyt7na53chxpK/C.pM6Z4o78S/URC',NULL,NULL,NULL,NULL,NULL,NULL),(17,'CC0724','Mardoqueo','Sabana Tobileri','mardoqueo.sabana@gmail.com','$2b$10$4bMd9SzbEX6WUmMsXVcr6.YiUyt7na53chxpK/C.pM6Z4o78S/URC',NULL,NULL,NULL,NULL,NULL,NULL),(18,'CC0095','Minerva Rosabel Ngui','Ondo Andeme','minerva.rosabel@gmail.com','$2b$10$4bMd9SzbEX6WUmMsXVcr6.YiUyt7na53chxpK/C.pM6Z4o78S/URC',NULL,NULL,NULL,NULL,NULL,NULL),(19,'CC0007','Pergentino','Segura Bodipo','pergentino.segura@gmail.com','$2b$10$4bMd9SzbEX6WUmMsXVcr6.YiUyt7na53chxpK/C.pM6Z4o78S/URC',NULL,NULL,NULL,NULL,NULL,NULL),(20,'CC3201','Maria Auxiliadora Angue','Ekua Esidang','maria.auxiliadora@gmail.com','$2b$10$4bMd9SzbEX6WUmMsXVcr6.YiUyt7na53chxpK/C.pM6Z4o78S/URC',NULL,NULL,NULL,NULL,NULL,NULL),(21,'S1802','Melisa','Castillo Roca','melisa.roca@gmail.com','$2b$10$spi0eVz6Arw0IwcbwjFP6.fFDnEkhdTfg4YHb/JnucFNbmYTigtly','555238746',NULL,NULL,NULL,NULL,NULL),(22,'A5263','Petronila Renata','Ebehe Andeme','petronila.andeme@gmail.com','$2b$10$OXyDLDCvEEqyfDii0gZNTevHbKoQIBH7FbJQ1AwYA4.ZiWEOUcbe2','555982378',NULL,NULL,NULL,NULL,NULL),(23,'EDU008','Brandon Nguema','Ondo Asue','brandon.nguema@gmail.com','$2b$10$eW7b/9iVjkVEfUBEmqi1lOF.cbqb665/dYF//Lr68GnVpvblEzI7.','222459635',NULL,NULL,NULL,NULL,NULL),(24,'EDU009','Christopher Ondo','Nguema Avomo','christopher.nsue@gmail.com','$2b$10$D2hQ.dC3BelB/ZO1DA/aFu78lgIJZM8ylgvOXBY4fZonQP69HPif6','555239865',NULL,NULL,NULL,NULL,NULL),(25,'EDU004','Gerson Edu','Enguru','gerson.edu@gmail.com','$2b$10$N.4pBLj7mrlXZS.57gtHw.TONdXbN5iDzsjsahPxgZfYo91YC2FbG',NULL,NULL,NULL,NULL,NULL,NULL),(26,'EDU010','Maria Soledad Nzang','Osa Angue','maria.soledad@gmail.com','$2b$10$vuNjy7OW1KdhSYuTOE7DeOGJIx38bndEYd7H4d9cem7OHvcclphIi',NULL,NULL,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2026-08-23  0:49:44

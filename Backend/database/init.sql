CREATE DATABASE IF NOT EXISTS educalocal;
USE educalocal;

CREATE TABLE IF NOT EXISTS `usuarios`  (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(20) UNIQUE,
  `nombre` varchar(255),
  `apellidos` varchar(255),
  `email` varchar(255) UNIQUE,
  `password` varchar(255),
  `telefono` varchar(255),
  `foto_perfil` text,
  `estado` varchar(255),
  `ultimo_login` datetime,
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE IF NOT EXISTS `centros` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255),
  `codigo` varchar(255) UNIQUE,
  `direccion` text,
  `ciudad` varchar(255),
  `pais` varchar(255),
  `telefono` varchar(255),
  `email` varchar(255),
  `logo` text,
  `estado` varchar(255),
  `created_at` timestamp,
  `updated_at` timestamp
);

CREATE TABLE IF NOT EXISTS `centro_usuarios` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `centro_id` int,
  `rol_en_centro` varchar(255),
  `estado` varchar(255),
  `fecha_union` date,
  `created_at` timestamp
);

ALTER TABLE `centro_usuarios` ADD FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);

ALTER TABLE `centro_usuarios` ADD FOREIGN KEY (`centro_id`) REFERENCES `centros` (`id`);

CREATE DATABASE IF NOT EXISTS `licitatrack_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `licitatrack_db`;

CREATE TABLE IF NOT EXISTS `processos_licitatorios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `objeto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `modalidade` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secretaria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_abertura` date NOT NULL,
  `situacao` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Planejado',
  `data_cadastro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  CONSTRAINT `chk_situacao` CHECK ((`situacao` in ('Planejado', 'Em andamento', 'Concluido', 'Cancelado')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `historico_processos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `processo_id` int NOT NULL,
  `situacao_anterior` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `situacao_nova` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacao` text COLLATE utf8mb4_unicode_ci,
  `data_alteracao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_historico_processo` (`processo_id`),
  CONSTRAINT `fk_historico_processo` FOREIGN KEY (`processo_id`)
    REFERENCES `processos_licitatorios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

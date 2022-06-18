
-- -----------------------------------------------------
-- Schema db_tybaChallenge
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_tybaChallenge` DEFAULT CHARACTER SET utf8 ;
USE `db_tybaChallenge` ;

-- -----------------------------------------------------
-- Table `db_tybaChallenge`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tybaChallenge`.`users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `email` VARCHAR(45) NOT NULL,
  `password` TEXT NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `accessKey` TEXT NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tybaChallenge`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tybaChallenge`.`roles` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `key` VARCHAR(45) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tybaChallenge`.`roles_user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tybaChallenge`.`roles_user` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `roleId` VARCHAR(36) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_users_has_roles_roles1_idx` (`roleId` ASC) VISIBLE,
  INDEX `fk_users_has_roles_users1_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `fk_users_has_roles_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `db_tybaChallenge`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_users_has_roles_roles1`
    FOREIGN KEY (`roleId`)
    REFERENCES `db_tybaChallenge`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_tybaChallenge`.`transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_tybaChallenge`.`transactions` (
  `id` VARCHAR(36) NOT NULL,
  `coordinates` JSON NULL DEFAULT NULL,
  `userId` VARCHAR(36) NOT NULL,
  `city` VARCHAR(45) NULL DEFAULT NULL,
  `results` JSON NULL DEFAULT NULL,
  `radius` INT(10) NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_transactions_users1_idx` (`userId` ASC) VISIBLE,
  CONSTRAINT `fk_transactions_users1`
    FOREIGN KEY (`userId`)
    REFERENCES `db_tybaChallenge`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE USER 'user_tybaChallenge' IDENTIFIED BY 'M5WCQrGV7b2KnKwoN';

GRANT ALL ON `db_tybaChallenge`.* TO 'user_tybaChallenge';
GRANT SELECT ON TABLE `db_tybaChallenge`.* TO 'user_tybaChallenge';
GRANT SELECT, INSERT, TRIGGER ON TABLE `db_tybaChallenge`.* TO 'user_tybaChallenge';
GRANT SELECT, INSERT, TRIGGER, UPDATE, DELETE ON TABLE `db_tybaChallenge`.* TO 'user_tybaChallenge';

-- -----------------------------------------------------
-- Data for table `db_tybaChallenge`.`roles`
-- -----------------------------------------------------
START TRANSACTION;
USE `db_tybaChallenge`;
INSERT INTO `db_tybaChallenge`.`roles` (`id`, `name`, `key`, `createdAt`, `updatedAt`) VALUES ('4096d317-eecd-458d-9027-f49904aa6978', 'user', 'user', DEFAULT, DEFAULT);
INSERT INTO `db_tybaChallenge`.`roles` (`id`, `name`, `key`, `createdAt`, `updatedAt`) VALUES ('4096d317-eecd-458d-9027-f49904aa6JN8', 'admin', 'admin', DEFAULT, DEFAULT);

-- User for test
INSERT INTO `db_tybaChallenge`.`users` (`id`, `name`, `email`, `password`, `status`, `accessKey`, `createdAt`, `updatedAt`) VALUES ('a36bafe2-5605-4480-8de6-8d7d50335352', 'Usuario test', 'test@test.com', '$2b$10$Fn2w37Tsj2q1tU/pNpyBMubPgdNtr7r1ov.3TiK86.s8zS.BxkByW', '1', NULL, '2022-06-18 13:40:44', '2022-06-18 15:39:12');
INSERT INTO `db_tybaChallenge`.`roles_user` (`id`, `userId`, `roleId`) VALUES ('cbb06e70-9355-4b80-9631-5e88020dda5j', 'a36bafe2-5605-4480-8de6-8d7d50335352', '4096d317-eecd-458d-9027-f49904aa6978');

COMMIT;
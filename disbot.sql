CREATE DATABASE disbot;
use disbot;

CREATE TABLE `adverts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `contact` text NOT NULL,
  `extLink` text NOT NULL,
  `imgLink` text NOT NULL,
  `expireDate` bigint DEFAULT NULL,
  `owner` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `apidocs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `endpoint_title` text NOT NULL,
  `endpoint_method` text NOT NULL,
  `endpoint_url` text NOT NULL,
  `endpoint_desc` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auditlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_type` int NOT NULL,
  `action_msg` text NOT NULL,
  `action_user` text NOT NULL,
  `action_date` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `botId` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `botName` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `botIcon` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otherOwners` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creatorId` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `creatorName` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createDate` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prefix` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prefixChange` tinyint(1) NOT NULL,
  `shortDesc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `inviteUrl` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `supportGuild` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `websiteLink` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `GithubLink` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `donateLink` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `library` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `longDesc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tagFun` tinyint(1) NOT NULL,
  `tagGames` tinyint(1) NOT NULL,
  `tagMusic` tinyint(1) NOT NULL,
  `tagEco` tinyint(1) NOT NULL,
  `tagMod` tinyint(1) NOT NULL,
  `tagAutomod` tinyint(1) NOT NULL,
  `tagLeveling` tinyint(1) NOT NULL,
  `tagSocial` tinyint(1) NOT NULL,
  `votes` bigint DEFAULT NULL,
  `avgRating` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `certified` tinyint(1) NOT NULL,
  `hidden` tinyint(1) NOT NULL,
  `nsfwContent` tinyint(1) NOT NULL,
  `pending` tinyint(1) NOT NULL,
  `authToken` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `serverCount` int DEFAULT NULL,
  `onlineStamp` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `shorturl` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tagUtility` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contactComments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contactId` int NOT NULL,
  `userId` text NOT NULL,
  `userName` text NOT NULL,
  `createDate` text NOT NULL,
  `comment` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `userId` text NOT NULL,
  `userName` text NOT NULL,
  `lastUpdated` text NOT NULL,
  `createDate` text NOT NULL,
  `openComment` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `p_name` text NOT NULL,
  `p_desc` text NOT NULL,
  `p_link` text NOT NULL,
  `p_image` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) NOT NULL,
  `creatorId` text NOT NULL,
  `creatorName` text NOT NULL,
  `botId` text NOT NULL,
  `reason` text NOT NULL,
  `addInfo` text,
  `date` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb3;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userIcon` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userName` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notifications` int DEFAULT NULL,
  `perm` int NOT NULL,
  `blacklisted` int NOT NULL,
  `postban` int NOT NULL,
  `discordSocial` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `githubSocial` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `twitterSocial` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1399 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `votes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `botId` text NOT NULL,
  `userId` text NOT NULL,
  `rating` int NOT NULL,
  `date` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1131 DEFAULT CHARSET=utf8mb3;

UNLOCK TABLES;

INSERT INTO adverts VALUES ('Disbot.top Release!', 'The official release of disbot.top!', 'https://faxes.zone', 'https://faxes.zone', 2506253287865, '0');
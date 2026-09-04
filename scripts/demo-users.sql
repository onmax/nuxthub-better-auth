INSERT OR IGNORE INTO `user` (`id`, `name`, `email`, `emailVerified`, `isAnonymous`, `role`)
VALUES ('demo-user', 'Demo User', 'user@nuxthub.demo', 1, 0, 'user');
--> statement-breakpoint
INSERT OR IGNORE INTO `account` (`id`, `issuer`, `accountId`, `providerId`, `userId`, `password`, `updatedAt`)
VALUES (
  'demo-user-credential',
  'local:credential',
  'demo-user',
  'credential',
  'demo-user',
  '68ac81147c4abde5e4f327eff6444965:a9038e573e449e7463ab40541c3405b58c0f049c6ba95123befd31ec7904e58e179803ec8e75b9e71ef65b0259e536119158c8499fb7e1f5be57b3fcd1359374',
  cast(unixepoch('subsecond') * 1000 as integer)
);
--> statement-breakpoint
INSERT OR IGNORE INTO `user` (`id`, `name`, `email`, `emailVerified`, `isAnonymous`, `role`)
VALUES ('demo-admin', 'Demo Admin', 'admin@nuxthub.demo', 1, 0, 'admin');
--> statement-breakpoint
INSERT OR IGNORE INTO `account` (`id`, `issuer`, `accountId`, `providerId`, `userId`, `password`, `updatedAt`)
VALUES (
  'demo-admin-credential',
  'local:credential',
  'demo-admin',
  'credential',
  'demo-admin',
  'edce0192806444c50415e565b2999a26:e1dcc77fb994b7755b7fd52ae121562151ff1ace1356317ef413b2155f71cae91edff142a819f8539302c1a7cef03e4aa665a7c5d77326bbec4da78a5f4c13ef',
  cast(unixepoch('subsecond') * 1000 as integer)
);

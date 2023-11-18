-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

INSERT INTO Permission VALUES('clonteiww0000yn4xulbszb1j','create','user','own','',1699330330688,1699330330688);
INSERT INTO Permission VALUES('clonteix20001yn4xmugyw12w','create','user','any','',1699330330694,1699330330694);
INSERT INTO Permission VALUES('clonteix30002yn4x72sd59ej','read','user','own','',1699330330696,1699330330696);
INSERT INTO Permission VALUES('clonteix40003yn4xwtyhara4','read','user','any','',1699330330697,1699330330697);
INSERT INTO Permission VALUES('clonteix50004yn4xk4eiox8a','update','user','own','',1699330330698,1699330330698);
INSERT INTO Permission VALUES('clonteix60005yn4xm1x8uknr','update','user','any','',1699330330699,1699330330699);
INSERT INTO Permission VALUES('clonteix80006yn4xf5r975os','delete','user','own','',1699330330700,1699330330700);
INSERT INTO Permission VALUES('clonteix90007yn4xqabm6cim','delete','user','any','',1699330330701,1699330330701);
INSERT INTO Permission VALUES('clonteixa0008yn4xjaiu0i0x','create','book','own','',1699330330703,1699330330703);
INSERT INTO Permission VALUES('clonteixb0009yn4xp8rcnw1v','create','book','any','',1699330330704,1699330330704);
INSERT INTO Permission VALUES('clonteixc000ayn4xspxg9j1f','read','book','own','',1699330330705,1699330330705);
INSERT INTO Permission VALUES('clonteixd000byn4x4huw0vxf','read','book','any','',1699330330705,1699330330705);
INSERT INTO Permission VALUES('clonteixe000cyn4xju9zkojq','update','book','own','',1699330330706,1699330330706);
INSERT INTO Permission VALUES('clonteixe000dyn4xneu27922','update','book','any','',1699330330707,1699330330707);
INSERT INTO Permission VALUES('clonteixf000eyn4xmuy0hdwl','delete','book','own','',1699330330708,1699330330708);
INSERT INTO Permission VALUES('clonteixg000fyn4xrtryz3zq','delete','book','any','',1699330330709,1699330330709);

INSERT INTO Role VALUES('clonteixi000gyn4x9vx0hwhd','admin','',1699330330711,1699330330711);
INSERT INTO Role VALUES('clonteixl000hyn4xs43bhlt9','user','',1699330330713,1699330330713);

INSERT INTO _PermissionToRole VALUES('clonteix20001yn4xmugyw12w','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteix40003yn4xwtyhara4','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteix60005yn4xm1x8uknr','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteix90007yn4xqabm6cim','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteixb0009yn4xp8rcnw1v','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteixd000byn4x4huw0vxf','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteixe000dyn4xneu27922','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteixg000fyn4xrtryz3zq','clonteixi000gyn4x9vx0hwhd');
INSERT INTO _PermissionToRole VALUES('clonteiww0000yn4xulbszb1j','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteix30002yn4x72sd59ej','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteix50004yn4xk4eiox8a','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteix80006yn4xf5r975os','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteixa0008yn4xjaiu0i0x','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteixc000ayn4xspxg9j1f','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteixe000cyn4xju9zkojq','clonteixl000hyn4xs43bhlt9');
INSERT INTO _PermissionToRole VALUES('clonteixf000eyn4xmuy0hdwl','clonteixl000hyn4xs43bhlt9');

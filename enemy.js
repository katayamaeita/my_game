// 敵：作る・入れる・動かす・描く（足すものの形）

const MAX_ENEMIES = 6;   // 敵は、同時にこの数まで
 
// ① 作る：敵を1体作って返す関数（呼ぶたびに、新しい敵が1体できる）
function createEnemy(x, vx,vy = 0) {
  return { x: x,startX: x, y: floor.y - 32, w: 32, h: 32, vx: vx, vy: vy,alive: true };
}

// ② 入れる：敵をまとめて入れる配列（７-６で入れ直すので let）
let enemies = [];
let spawnTimer = 0;   // 敵を出すタイマー
let nextSpawn = 2;    // 次の敵を出すまでの時間（秒）
let spTimer = 0;

// 最初の敵を入れ直す（★ main.js の resetGame から呼ばれる）
function resetEnemies() {
  enemies = [];
  enemies.push(createEnemy(200, 80));
  enemies.push(createEnemy(380, -120));
  enemies.push(createEnemy(540, 60));
  const special = createEnemy(300, 80);  //見張りの敵初期,位置から左右に80px
  special.type="look";
  enemies.push(special);
  // ↑ 授業でくじの敵を足した人は、その行（const special = … から enemies.push(special); まで）もここへ
  spawnTimer = 0;
  nextSpawn = 2;
}

// 敵を時間で出す（タイマーの形・くり返す）
function spawnEnemies(dt) {
  spawnTimer = spawnTimer + dt;
  spTimer = spTimer + dt;
  if (spawnTimer >= nextSpawn) {
    if (enemies.length < MAX_ENEMIES) {
      // 左の端か右の端か、くじで決める
      if (Math.random() < 0.5) {
        enemies.push(createEnemy(0, 100));                    // 左の端から、右へ
      } else {
        enemies.push(createEnemy(canvas.width - 32, -100));   // 右の端から、左へ
      }
    }
    spawnTimer = 0;
    nextSpawn = 1 + Math.random() * 2;   // 次は 1〜3 秒のどれか
  }
  if (spTimer >= 20) {
    if (enemies.length < MAX_ENEMIES) {
      const unique = createEnemy(0, 100, -JUMP_SPEED * 0.8);
      unique.type = "jump";
      enemies.push(unique);
    }
    spTimer = 0;
  }
}
 

// ③ 動かす：配列の敵を1体ずつ取り出して、同じ処理をする
function updateEnemies(dt) {
  for (const enemy of enemies) {
    enemy.x = enemy.x + enemy.vx * dt;
    // 端を越えたら、位置を戻して、向きを反対に（５-４の跳ね返り）
    if (enemy.x < 0) {
      enemy.x = 0;
      enemy.vx = -enemy.vx;
    }
    if (enemy.x + enemy.w > canvas.width) {
      enemy.x = canvas.width - enemy.w;
      enemy.vx = -enemy.vx;
    }
    if(enemy.type === "look"){
      if(enemy.x > enemy.startX + 80){
        enemy.x = enemy.startX + 80
        enemy.vx = -enemy.vx;
      }
      if(enemy.x < enemy.startX - 80){
        enemy.x = enemy.startX - 80
        enemy.vx = -enemy.vx;
      }
    }
    if (enemy.type === "jump") {
      const g = enemy.vy > 0 ? GRAVITY * FALL_GRAVITY_RATE : GRAVITY;
      enemy.vy = enemy.vy + g * dt;
      enemy.y = enemy.y + enemy.vy * dt;

      if (enemy.y + enemy.h >= floor.y) {
        enemy.y = floor.y - enemy.h;
        enemy.vy = -JUMP_SPEED * 0.8;
      }
    }
  }
}
// プレイヤーとぶつかったとき：上から落ちてきたときだけ、敵を倒す
function collideWithEnemies(prevBottom) {
  for (const enemy of enemies) {
    if (aabb(player, enemy) && prevBottom <= enemy.y && player.vy > 0) {
      enemy.alive = false;            // 倒した（状態を書き換える）
      player.vy = -JUMP_SPEED / 2;    // 踏んだら、少し跳ねる
      score = score + 1;              // 点数を足す（★ main.js の score を書き換える）
    } else if (aabb(player, enemy) && player.hitTimer <= 0) {
      player.hp = player.hp - 1;      // 横から当たった：HP を減らす（★ player.js の値を書き換える）
      player.hitTimer = HIT_TIME;     // しばらく当たらない
    }
  }
  enemies = enemies.filter((enemy) => enemy.alive);   // 生きている敵だけを残す
}  
   
// ④ 描く：配列の敵を1体ずつ取り出して描く
function drawEnemies() {
  ctx.fillStyle = "#ff6b6b";
  for (const enemy of enemies) {
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
  }
  ctx.fillStyle = "#e8eeff";
  ctx.fillText("敵 = " + enemies.length, 10, 40);
}
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEmbeddingIndex,
  cosineSimilarity,
  embedPlayer,
  l2Normalize,
  parseSimilarLimit,
  playerHeightInches,
  playerWeightPounds,
  positionGroup,
  rankSimilarPlayers,
  rawPlayerFeatures,
  similarityPercent,
  zScore,
} from '../lib/player-embeddings.js';

const player = (overrides) => ({
  playerId: overrides.playerId,
  player_name: overrides.player_name || String(overrides.playerId),
  position: overrides.position || 'C',
  games: 200,
  goals: 0,
  assists: 0,
  points: 0,
  wins: 0,
  losses: 0,
  last_season: 20232024,
  ...overrides,
});

const corpus = [
  player({
    playerId: 1,
    player_name: 'Connor McDavid',
    position: 'C',
    games: 700,
    goals: 350,
    assists: 700,
    points: 1050,
    heightInInches: 73,
    weightInPounds: 194,
  }),
  player({
    playerId: 2,
    player_name: 'Leon Draisaitl',
    position: 'C',
    games: 700,
    goals: 380,
    assists: 520,
    points: 900,
    heightInInches: 74,
    weightInPounds: 208,
  }),
  player({
    playerId: 3,
    player_name: 'Nikita Kucherov',
    position: 'R',
    games: 650,
    goals: 280,
    assists: 520,
    points: 800,
    heightInInches: 71,
    weightInPounds: 181,
  }),
  player({
    playerId: 4,
    player_name: 'Auston Matthews',
    position: 'C',
    games: 550,
    goals: 370,
    assists: 280,
    points: 650,
    heightInInches: 75,
    weightInPounds: 215,
  }),
  player({
    playerId: 5,
    player_name: 'Alex Ovechkin',
    position: 'L',
    games: 1400,
    goals: 850,
    assists: 700,
    points: 1550,
    heightInInches: 75,
    weightInPounds: 238,
  }),
  player({
    playerId: 6,
    player_name: 'Bottom-six forward',
    position: 'C',
    games: 500,
    goals: 60,
    assists: 80,
    points: 140,
    heightInInches: 72,
    weightInPounds: 190,
  }),
  player({
    playerId: 7,
    player_name: 'Roman Josi',
    position: 'D',
    games: 800,
    goals: 150,
    assists: 500,
    points: 650,
    heightInInches: 73,
    weightInPounds: 201,
  }),
  player({
    playerId: 8,
    player_name: 'Victor Hedman',
    position: 'D',
    games: 1000,
    goals: 120,
    assists: 550,
    points: 670,
    heightInInches: 78,
    weightInPounds: 223,
  }),
  player({
    playerId: 9,
    player_name: 'Depth defenseman',
    position: 'D',
    games: 400,
    goals: 12,
    assists: 40,
    points: 52,
    heightInInches: 73,
    weightInPounds: 198,
  }),
  player({
    playerId: 10,
    player_name: 'Andrei Vasilevskiy',
    position: 'G',
    games: 400,
    wins: 260,
    losses: 110,
    heightInInches: 75,
    weightInPounds: 218,
  }),
  player({
    playerId: 11,
    player_name: 'Connor Hellebuyck',
    position: 'G',
    games: 450,
    wins: 270,
    losses: 140,
    heightInInches: 76,
    weightInPounds: 207,
  }),
  player({
    playerId: 12,
    player_name: 'Backup goalie',
    position: 'G',
    games: 80,
    wins: 25,
    losses: 40,
    heightInInches: 74,
    weightInPounds: 190,
  }),
];

test('position groups keep forwards, defense, and goalies separate', () => {
  assert.equal(positionGroup('C'), 'F');
  assert.equal(positionGroup('L'), 'F');
  assert.equal(positionGroup('RW'), 'F');
  assert.equal(positionGroup('D'), 'D');
  assert.equal(positionGroup('G'), 'G');
});

test('rate features describe scoring mix independently of games played', () => {
  const mcdavid = rawPlayerFeatures(corpus[0]);
  const matthews = rawPlayerFeatures(corpus.find((item) => item.playerId === 4));
  assert.equal(Number(mcdavid.pointsPerGame.toFixed(2)), 1.5);
  assert.ok(mcdavid.assistsPerGame > matthews.assistsPerGame);
  assert.ok(matthews.goalShare > mcdavid.goalShare);
});

test('vectors are L2-normalized and identical players have cosine 1', () => {
  const index = buildEmbeddingIndex(corpus);
  const vector = index.byId.get('1').vector;
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  assert.ok(Math.abs(norm - 1) < 1e-9);
  assert.equal(Number(cosineSimilarity(vector, vector).toFixed(6)), 1);
  assert.deepEqual(l2Normalize([0, 0, 0]), [0, 0, 0]);
  assert.equal(zScore(10, 10, 0), 0);
  assert.equal(similarityPercent(1), 100);
  assert.equal(similarityPercent(-1), 0);
  assert.equal(parseSimilarLimit('99'), 20);
  assert.equal(parseSimilarLimit('nope'), 8);
});

test('McDavid-like playmakers rank closer than snipers or depth scorers', () => {
  const index = buildEmbeddingIndex(corpus);
  const ranked = rankSimilarPlayers(index, corpus[0], { limit: 8, minSimilarity: 0 });
  const names = ranked.map((entry) => entry.player.player_name);
  const rankOf = (name) => names.indexOf(name);

  assert.deepEqual(names.slice(0, 2).sort(), ['Leon Draisaitl', 'Nikita Kucherov']);
  assert.ok(rankOf('Nikita Kucherov') < rankOf('Bottom-six forward'));
  assert.ok(rankOf('Leon Draisaitl') < rankOf('Auston Matthews'));
  assert.ok(!names.includes('Roman Josi'));
  assert.ok(!names.includes('Andrei Vasilevskiy'));
  assert.ok(ranked[0].similarity >= 80);
  assert.ok(ranked[0].reasons.length > 0);
  assert.ok(!ranked[0].reasons.includes('era'));

  const closeMatches = rankSimilarPlayers(index, corpus[0], { limit: 8 });
  assert.deepEqual(closeMatches.map((entry) => entry.player.player_name), [
    'Nikita Kucherov',
    'Leon Draisaitl',
  ]);
});

test('goal scorers cluster together and exclude the seed player', () => {
  const index = buildEmbeddingIndex(corpus);
  const matthews = corpus.find((item) => item.playerId === 4);
  const ranked = rankSimilarPlayers(index, matthews, { limit: 8, excludeIds: [4], minSimilarity: 0 });
  const ids = ranked.map((entry) => entry.player.playerId);

  assert.ok(!ids.includes(4));
  assert.equal(ranked[0].player.player_name, 'Alex Ovechkin');
  assert.ok(ids.indexOf(5) < ids.indexOf(6));
  assert.ok(ranked.every((entry) => positionGroup(entry.player.position) === 'F'));
});

test('defensemen and goalies only return the same position group', () => {
  const index = buildEmbeddingIndex(corpus);
  const defense = rankSimilarPlayers(index, corpus.find((item) => item.playerId === 7), { limit: 5, minSimilarity: 0 });
  const goalies = rankSimilarPlayers(index, corpus.find((item) => item.playerId === 10), { limit: 5, minSimilarity: 0 });

  assert.ok(defense.length > 0);
  assert.ok(goalies.length > 0);
  assert.ok(defense.every((entry) => entry.group === 'D'));
  assert.ok(goalies.every((entry) => entry.group === 'G'));
  assert.equal(goalies[0].player.player_name, 'Connor Hellebuyck');
});

test('players below the sample cutoff can still query against the indexed group', () => {
  const index = buildEmbeddingIndex(corpus);
  const rookie = player({
    playerId: 99,
    player_name: 'Young sniper',
    position: 'C',
    games: 20,
    goals: 14,
    assists: 8,
    points: 22,
  });
  const ranked = rankSimilarPlayers(index, rookie, { limit: 3, minSimilarity: 0 });
  assert.ok(ranked.length > 0);
  assert.ok(ranked.some((entry) => entry.player.player_name === 'Auston Matthews'));
  const vector = embedPlayer(rookie, index.statsByGroup.F, 'F');
  assert.equal(vector.length, index.byId.get('4').vector.length);
});

test('height and weight pull similarly productive players toward matching size', () => {
  assert.equal(Math.round(playerHeightInches({ heightInCentimeters: 185 })), 73);
  assert.equal(Math.round(playerWeightPounds({ weightInKilograms: 88 })), 194);
  assert.equal(playerHeightInches({ heightInInches: 12 }), null);

  const sized = [
    player({
      playerId: 20,
      player_name: 'Target sniper',
      games: 500,
      goals: 250,
      assists: 200,
      points: 450,
      heightInInches: 75,
      weightInPounds: 220,
    }),
    player({
      playerId: 21,
      player_name: 'Big sniper',
      games: 500,
      goals: 248,
      assists: 198,
      points: 446,
      heightInInches: 76,
      weightInPounds: 228,
    }),
    player({
      playerId: 22,
      player_name: 'Small sniper',
      games: 500,
      goals: 252,
      assists: 202,
      points: 454,
      heightInInches: 68,
      weightInPounds: 172,
    }),
    player({
      playerId: 23,
      player_name: 'Playmaker',
      games: 500,
      goals: 120,
      assists: 350,
      points: 470,
      heightInInches: 75,
      weightInPounds: 218,
    }),
  ];
  const ranked = rankSimilarPlayers(buildEmbeddingIndex(sized), sized[0], { limit: 3, minSimilarity: 0 });
  const names = ranked.map((entry) => entry.player.player_name);
  assert.equal(names[0], 'Big sniper');
  assert.ok(names.indexOf('Big sniper') < names.indexOf('Small sniper'));
});

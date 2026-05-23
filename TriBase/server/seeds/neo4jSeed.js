const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || '1234567890-=';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[rand(0, arr.length - 1)];

async function seed() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  try {
    await driver.verifyConnectivity();
    console.log('Neo4j Connected. Seeding MovieNetworkDB...');
  } catch (err) {
    console.error('Neo4j connection failed:', err.message);
    process.exit(1);
  }

  const session = driver.session();
  try {
    // Clear everything
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('  Old data cleared.');

    // ── Genres (15) ─────────────────────────────────────────────────
    const genreNames = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Animation', 'Documentary', 'Fantasy', 'Adventure', 'Crime', 'Mystery', 'Biography', 'History'];
    for (const name of genreNames) {
      await session.run('CREATE (:Genre {name: $name})', { name });
    }
    console.log('  ✓ 15 Genres');

    // ── Studios (30) ────────────────────────────────────────────────
    const studioNames = [
      'Warner Bros', 'Universal Pictures', 'Paramount Pictures', 'Sony Pictures', '20th Century Fox',
      'Walt Disney Pictures', 'Columbia Pictures', 'MGM', 'Lionsgate', 'New Line Cinema',
      'DreamWorks', 'Miramax', 'A24', 'Blumhouse', 'Netflix Studios',
      'Apple TV+', 'Amazon Studios', 'HBO Films', 'Focus Features', 'Annapurna Pictures',
      'Plan B Entertainment', 'Bad Robot', 'Legendary Entertainment', 'Imagine Entertainment', 'Summit Entertainment',
      'Relativity Media', 'FilmNation', 'StudioCanal', 'Working Title', 'Castle Rock'
    ];
    for (const name of studioNames) {
      await session.run('CREATE (:Studio {name: $name, founded: $founded})', { name, founded: rand(1920, 2010) });
    }
    console.log('  ✓ 30 Studios');

    // ── Awards (50) ─────────────────────────────────────────────────
    const awardCategories = ['Best Picture', 'Best Director', 'Best Actor', 'Best Actress', 'Best Supporting Actor', 'Best Supporting Actress', 'Best Original Screenplay', 'Best Visual Effects', 'Best Score', 'Best Cinematography'];
    const awardShows = ['Academy Award', 'Golden Globe', 'BAFTA', 'SAG Award', 'Critics Choice'];
    for (let i = 0; i < 50; i++) {
      await session.run('CREATE (:Award {name: $name, category: $category, show: $show})', {
        name: `${pick(awardShows)} - ${pick(awardCategories)}`,
        category: pick(awardCategories),
        show: pick(awardShows)
      });
    }
    console.log('  ✓ 50 Awards');

    // ── Persons (300) ────────────────────────────────────────────────
    const firstNames = ['James', 'Emma', 'Robert', 'Natalie', 'Tom', 'Jennifer', 'Brad', 'Angelina', 'Chris', 'Scarlett', 'Denzel', 'Meryl', 'Leonardo', 'Cate', 'Morgan', 'Julia', 'Will', 'Sandra', 'Anthony', 'Viola', 'Ryan', 'Amy', 'Mark', 'Charlize', 'Christian', 'Halle', 'Matt', 'Reese', 'Samuel', 'Nicole'];
    const lastNames = ['Smith', 'Watson', 'Downey', 'Portman', 'Hanks', 'Lawrence', 'Pitt', 'Jolie', 'Evans', 'Johansson', 'Washington', 'Streep', 'DiCaprio', 'Blanchett', 'Freeman', 'Roberts', 'Ferrell', 'Bullock', 'Hopkins', 'Davis', 'Reynolds', 'Adams', 'Ruffalo', 'Theron', 'Bale', 'Berry', 'Damon', 'Witherspoon', 'Jackson', 'Kidman'];
    const personIds = [];
    for (let i = 0; i < 300; i++) {
      const name = `${pick(firstNames)} ${pick(lastNames)} ${i > 59 ? i : ''}`.trim();
      const born = rand(1940, 1995);
      const result = await session.run(
        'CREATE (p:Person {name: $name, born: $born, nationality: $nat}) RETURN id(p) as pid',
        { name, born, nat: pick(['American', 'British', 'Australian', 'Canadian', 'French']) }
      );
      personIds.push(result.records[0].get('pid').toNumber());
    }
    console.log('  ✓ 300 Persons');

    // ── Movies (200) ─────────────────────────────────────────────────
    const adjMovies = ['The Dark', 'Lost in', 'Rise of', 'Fall of', 'Beyond', 'Into the', 'Escape from', 'Return to', 'Last', 'Final'];
    const nounMovies = ['Kingdom', 'Space', 'Silence', 'Storm', 'Shadow', 'Empire', 'City', 'Ocean', 'Mountain', 'Fire'];
    const movieIds = [];
    for (let i = 0; i < 200; i++) {
      const title = `${pick(adjMovies)} ${pick(nounMovies)} ${i > 99 ? 'II' : ''}`.trim();
      const result = await session.run(
        `CREATE (m:Movie {
          title: $title,
          released: $released,
          tagline: $tagline,
          rating: $rating,
          runtime: $runtime
        }) RETURN id(m) as mid`,
        {
          title: `${title} (${i + 1})`,
          released: rand(1980, 2024),
          tagline: pick(['A story of courage.', 'The world will never be the same.', 'Some legends are born.', 'In the end, only truth remains.', 'Destiny calls.']),
          rating: parseFloat((rand(50, 99) / 10).toFixed(1)),
          runtime: rand(85, 180)
        }
      );
      movieIds.push(result.records[0].get('mid').toNumber());
    }
    console.log('  ✓ 200 Movies');

    // ── ACTED_IN relationships (1200) ────────────────────────────────
    let actedCount = 0;
    for (let i = 0; i < 1200; i++) {
      const personId = pick(personIds);
      const movieId = pick(movieIds);
      await session.run(
        `MATCH (p:Person) WHERE id(p) = $pid
         MATCH (m:Movie) WHERE id(m) = $mid
         MERGE (p)-[:ACTED_IN {role: $role, billingOrder: $billing}]->(m)`,
        { pid: neo4j.int(personId), mid: neo4j.int(movieId), role: pick(['Lead', 'Supporting', 'Cameo', 'Villain', 'Mentor']), billing: rand(1, 10) }
      );
      actedCount++;
    }
    console.log(`  ✓ ~1200 ACTED_IN relationships`);

    // ── DIRECTED relationships (200) ─────────────────────────────────
    for (let i = 0; i < 200; i++) {
      const personId = pick(personIds);
      const movieId = movieIds[i];
      await session.run(
        `MATCH (p:Person) WHERE id(p) = $pid
         MATCH (m:Movie) WHERE id(m) = $mid
         MERGE (p)-[:DIRECTED]->(m)`,
        { pid: neo4j.int(personId), mid: neo4j.int(movieId) }
      );
    }
    console.log('  ✓ 200 DIRECTED relationships');

    // ── BELONGS_TO relationships (300) ───────────────────────────────
    for (let i = 0; i < 300; i++) {
      const movieId = pick(movieIds);
      await session.run(
        `MATCH (m:Movie) WHERE id(m) = $mid
         MATCH (g:Genre {name: $genre})
         MERGE (m)-[:BELONGS_TO]->(g)`,
        { mid: neo4j.int(movieId), genre: pick(genreNames) }
      );
    }
    console.log('  ✓ 300 BELONGS_TO relationships');

    // ── PRODUCED_BY relationships (200) ──────────────────────────────
    for (let i = 0; i < 200; i++) {
      const movieId = movieIds[i];
      await session.run(
        `MATCH (m:Movie) WHERE id(m) = $mid
         MATCH (s:Studio {name: $studio})
         MERGE (m)-[:PRODUCED_BY]->(s)`,
        { mid: neo4j.int(movieId), studio: pick(studioNames) }
      );
    }
    console.log('  ✓ 200 PRODUCED_BY relationships');

    // ── WON relationships (150) ───────────────────────────────────────
    const awardResult = await session.run('MATCH (a:Award) RETURN id(a) as aid LIMIT 50');
    const awardIds = awardResult.records.map(r => r.get('aid').toNumber());
    for (let i = 0; i < 150; i++) {
      const personId = pick(personIds);
      const awardId = pick(awardIds);
      await session.run(
        `MATCH (p:Person) WHERE id(p) = $pid
         MATCH (a:Award) WHERE id(a) = $aid
         MERGE (p)-[:WON {year: $year}]->(a)`,
        { pid: neo4j.int(personId), aid: neo4j.int(awardId), year: rand(1980, 2024) }
      );
    }
    console.log('  ✓ 150 WON relationships');

    // Create indexes
    await session.run('CREATE INDEX movie_title IF NOT EXISTS FOR (m:Movie) ON (m.title)');
    await session.run('CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name)');
    console.log('  ✓ Indexes created');

    console.log('\n✅ Neo4j MovieNetworkDB seeded successfully!\n');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();

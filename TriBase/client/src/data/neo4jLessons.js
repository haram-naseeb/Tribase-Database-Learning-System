export const neo4jLessons = [
  // GROUP 1: MATCH Basics
  { id:'n4-1', group:'MATCH Basics', title:'MATCH All Nodes', difficulty:1,
    explanation:'MATCH is the primary clause for finding data in Neo4j. It describes a pattern to search for. (n) matches any node.',
    syntax:'MATCH (n) RETURN n LIMIT 10',
    example:'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 20',
    proTip:'Always add LIMIT when exploring — the MovieNetworkDB has thousands of nodes.' },

  { id:'n4-2', group:'MATCH Basics', title:'MATCH by Label', difficulty:1,
    explanation:'Labels classify nodes into types. Use :Label to filter by type — like a table name in SQL.',
    syntax:'MATCH (n:Label) RETURN n LIMIT 10',
    example:'MATCH (m:Movie) RETURN m.title, m.released, m.rating ORDER BY m.released DESC LIMIT 10',
    proTip:'A node can have multiple labels: MATCH (n:Person:Director).' },

  { id:'n4-3', group:'MATCH Basics', title:'MATCH Relationships', difficulty:1,
    explanation:'Relationships connect nodes. Use -[:TYPE]-> to match a directed relationship between two nodes.',
    syntax:'MATCH (a)-[:REL_TYPE]->(b) RETURN a, b',
    example:'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 20',
    proTip:'Omit the arrow for undirected: (a)-[:TYPE]-(b). Use this when direction does not matter.' },

  { id:'n4-4', group:'MATCH Basics', title:'RETURN Clause', difficulty:1,
    explanation:'RETURN specifies what data to output. You can return node properties, relationship properties, or entire nodes.',
    syntax:'MATCH (n:Label) RETURN n.property AS alias LIMIT 10',
    example:'MATCH (m:Movie) RETURN m.title AS title, m.released AS year, m.rating AS rating ORDER BY rating DESC LIMIT 10',
    proTip:'Use AS to alias output columns, just like SQL.' },

  { id:'n4-5', group:'MATCH Basics', title:'WHERE Clause', difficulty:1,
    explanation:'WHERE filters results after MATCH. Supports =, <>, <, >, AND, OR, NOT, IN, STARTS WITH, ENDS WITH, CONTAINS.',
    syntax:'MATCH (n:Label) WHERE n.property = value RETURN n',
    example:'MATCH (m:Movie) WHERE m.released >= 2000 AND m.rating > 8.0 RETURN m.title, m.released, m.rating ORDER BY m.rating DESC LIMIT 10',
    proTip:'You can also inline filters: MATCH (m:Movie {released: 2020}) — equivalent to WHERE.' },

  // GROUP 2: Filtering
  { id:'n4-6', group:'Filtering', title:'Property Filter', difficulty:1,
    explanation:'Filter nodes by property values directly in the MATCH pattern or using WHERE.',
    syntax:'MATCH (n:Label {property: value}) RETURN n',
    example:"MATCH (p:Person {nationality: 'American'}) RETURN p.name, p.born ORDER BY p.born LIMIT 10",
    proTip:'Inline property matching MATCH (n {key: val}) is faster than WHERE for equality checks.' },

  { id:'n4-7', group:'Filtering', title:'String Operators', difficulty:2,
    explanation:'Cypher supports STARTS WITH, ENDS WITH, CONTAINS for string matching. Case sensitive by default.',
    syntax:"WHERE n.property STARTS WITH 'prefix'",
    example:"MATCH (m:Movie) WHERE m.title CONTAINS 'Kingdom' RETURN m.title, m.released LIMIT 10",
    proTip:'Use toLower() for case-insensitive: WHERE toLower(n.name) CONTAINS \"smith\".' },

  { id:'n4-8', group:'Filtering', title:'IN Operator', difficulty:1,
    explanation:'IN checks if a value is in a list. Works like SQL IN — clean alternative to multiple OR conditions.',
    syntax:'WHERE n.property IN [val1, val2, val3]',
    example:"MATCH (p:Person) WHERE p.nationality IN ['British', 'Australian'] RETURN p.name, p.nationality LIMIT 10",
    proTip:'NOT IN also works: WHERE n.prop NOT IN [...].' },

  { id:'n4-9', group:'Filtering', title:'Relationship Type Filter', difficulty:2,
    explanation:'Filter by relationship type using the pipe | for OR between types.',
    syntax:'MATCH (a)-[:TYPE1|TYPE2]->(b) RETURN a, b',
    example:'MATCH (p:Person)-[r:ACTED_IN|DIRECTED]->(m:Movie) RETURN p, r, m LIMIT 20',
    proTip:'The | operator lets you match multiple relationship types in one pattern.' },

  { id:'n4-10', group:'Filtering', title:'IS NULL / IS NOT NULL', difficulty:2,
    explanation:'Check for missing properties using IS NULL. Properties not set on a node return NULL.',
    syntax:'WHERE n.property IS NULL',
    example:'MATCH (m:Movie) WHERE m.tagline IS NOT NULL RETURN m.title, m.tagline LIMIT 10',
    proTip:'In Neo4j, a missing property and a property set to null are treated the same.' },

  // GROUP 3: CREATE
  { id:'n4-11', group:'CREATE', title:'CREATE Node', difficulty:1,
    explanation:'CREATE creates new nodes. Specify labels with : and properties as a map.',
    syntax:'CREATE (n:Label {property: value}) RETURN n',
    example:"CREATE (m:Movie {title: 'TestMovie', released: 2024, rating: 8.5}) RETURN m",
    proTip:'CREATE always creates a new node — even if a matching one exists. Use MERGE to avoid duplicates.' },

  { id:'n4-12', group:'CREATE', title:'CREATE Relationship', difficulty:2,
    explanation:'Create relationships between two nodes. Both nodes must already exist or be created in the same statement.',
    syntax:'MATCH (a:A), (b:B) WHERE a.name=$n1 AND b.name=$n2 CREATE (a)-[:REL]->(b)',
    example:'MATCH (p:Person {name: "James Smith 1"}), (m:Movie {title: "The Dark Kingdom (1)"}) CREATE (p)-[:ACTED_IN {role: "Hero"}]->(m) RETURN p.name, m.title',
    proTip:'Always MATCH the nodes first before creating relationships between them.' },

  { id:'n4-13', group:'CREATE', title:'CREATE with Multiple Nodes', difficulty:2,
    explanation:'Create multiple nodes and relationships in one statement by chaining them.',
    syntax:'CREATE (a:A {prop: val})-[:REL]->(b:B {prop: val})',
    example:'CREATE (g:Genre {name: "Experimental"})-[:SUBGENRE_OF]->(parent:Genre {name: "Indie"}) RETURN g, parent',
    proTip:'This creates both nodes AND the relationship atomically in one operation.' },

  { id:'n4-14', group:'CREATE', title:'MERGE — Avoid Duplicates', difficulty:2,
    explanation:'MERGE matches an existing node/relationship or creates it if it does not exist. The safe alternative to CREATE.',
    syntax:'MERGE (n:Label {property: value}) RETURN n',
    example:'MERGE (g:Genre {name: "Action"}) ON CREATE SET g.created = true ON MATCH SET g.accessed = true RETURN g',
    proTip:'MERGE is idempotent — safe to run multiple times. Always MERGE on unique identifiers.' },

  { id:'n4-15', group:'CREATE', title:'CREATE with Props', difficulty:1,
    explanation:'Set multiple properties at creation time using a property map.',
    syntax:'CREATE (n:Label {p1: v1, p2: v2, p3: v3})',
    example:"CREATE (s:Studio {name: 'TestStudio', founded: 2024, country: 'USA'}) RETURN s",
    proTip:'Use SET after MATCH to add properties to existing nodes.' },

  // GROUP 4: UPDATE
  { id:'n4-16', group:'UPDATE', title:'SET Property', difficulty:1,
    explanation:'SET updates or adds properties on matched nodes or relationships.',
    syntax:'MATCH (n:Label {key: val}) SET n.property = newValue RETURN n',
    example:'MATCH (m:Movie) WHERE m.title CONTAINS "(1)" SET m.featured = true RETURN m.title, m.featured LIMIT 5',
    proTip:'SET n += {prop: val} merges properties without removing existing ones.' },

  { id:'n4-17', group:'UPDATE', title:'SET Multiple Properties', difficulty:1,
    explanation:'Update multiple properties at once using comma separation or a property map.',
    syntax:'SET n.p1 = v1, n.p2 = v2\nSET n += {p1: v1, p2: v2}',
    example:'MATCH (m:Movie) WHERE id(m) = 0 SET m.rating = 9.5, m.featured = true RETURN m.title, m.rating, m.featured',
    proTip:'SET n = {map} replaces ALL properties. SET n += {map} merges. Prefer += for partial updates.' },

  { id:'n4-18', group:'UPDATE', title:'REMOVE Property', difficulty:2,
    explanation:'REMOVE deletes a property from a node or removes a label.',
    syntax:'MATCH (n) WHERE condition REMOVE n.property RETURN n',
    example:'MATCH (m:Movie) WHERE m.featured = true REMOVE m.featured RETURN m.title LIMIT 5',
    proTip:'REMOVE n.prop is different from SET n.prop = null. REMOVE truly deletes the property.' },

  { id:'n4-19', group:'UPDATE', title:'SET / REMOVE Label', difficulty:2,
    explanation:'You can add or remove labels on existing nodes dynamically.',
    syntax:'MATCH (n) SET n:NewLabel\nMATCH (n) REMOVE n:OldLabel',
    example:'MATCH (m:Movie) WHERE m.rating > 9.0 SET m:TopRated RETURN labels(m), m.title LIMIT 5',
    proTip:'Labels are indexed — adding a label enables fast lookups on that label type.' },

  // GROUP 5: DELETE
  { id:'n4-20', group:'DELETE', title:'DELETE Node', difficulty:2,
    explanation:'DELETE removes a node. The node must have no relationships — use DETACH DELETE to remove those too.',
    syntax:'MATCH (n:Label {prop: val}) DELETE n',
    example:'MATCH (g:Genre {name: "Experimental"}) DELETE g',
    proTip:'Attempting to DELETE a node with relationships throws an error. Use DETACH DELETE to be safe.' },

  { id:'n4-21', group:'DELETE', title:'DETACH DELETE', difficulty:2,
    explanation:'DETACH DELETE removes a node AND all its relationships in one operation.',
    syntax:'MATCH (n:Label {prop: val}) DETACH DELETE n',
    example:'MATCH (s:Studio {name: "TestStudio"}) DETACH DELETE s',
    proTip:'Be careful with DETACH DELETE on heavily connected nodes — it can remove many relationships.' },

  { id:'n4-22', group:'DELETE', title:'DELETE Relationship', difficulty:2,
    explanation:'Delete only a relationship while keeping both nodes.',
    syntax:'MATCH (a)-[r:TYPE]->(b) WHERE condition DELETE r',
    example:'MATCH (m:Movie {title: "TestMovie"})-[r:ACTED_IN]-() DELETE r\nMATCH (m:Movie {title: "TestMovie"}) DETACH DELETE m',
    proTip:'Always match the relationship to a variable [r] before deleting it.' },

  // GROUP 6: Pattern Matching
  { id:'n4-23', group:'Pattern Matching', title:'Variable Length Paths', difficulty:3,
    explanation:'Match paths of variable length using *min..max notation. Finds indirect connections.',
    syntax:'MATCH (a)-[:REL*2..4]->(b) RETURN a, b',
    example:'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) WHERE m.rating > 8.5 RETURN p, r, m LIMIT 20',
    proTip:'Variable paths can be slow on large graphs. Always set an upper bound like *1..3.' },

  { id:'n4-24', group:'Pattern Matching', title:'shortestPath()', difficulty:3,
    explanation:'shortestPath() finds the shortest path between two nodes. Returns the path object.',
    syntax:'MATCH p=shortestPath((a)-[*]-(b)) WHERE ... RETURN p',
    example:'MATCH (p1:Person), (p2:Person) WHERE p1.name <> p2.name WITH p1, p2 LIMIT 2 MATCH path=shortestPath((p1)-[*]-(p2)) RETURN [n IN nodes(path) | coalesce(n.name, n.title)] AS path_nodes, length(path) AS hops LIMIT 3',
    proTip:'shortestPath ignores relationship direction by default. Use -[*]-> for directed paths.' },

  { id:'n4-25', group:'Pattern Matching', title:'OPTIONAL MATCH', difficulty:2,
    explanation:'OPTIONAL MATCH is like LEFT JOIN — returns null for missing pattern matches instead of excluding the row.',
    syntax:'OPTIONAL MATCH (n)-[:REL]->(m) RETURN n, m',
    example:'MATCH (m:Movie)-[r:BELONGS_TO]->(g:Genre) RETURN m, r, g LIMIT 20',
    proTip:'Use OPTIONAL MATCH when you want results even if a relationship does not exist.' },

  { id:'n4-26', group:'Pattern Matching', title:'Bidirectional Patterns', difficulty:2,
    explanation:'Match relationships in either direction by omitting the arrowhead.',
    syntax:'MATCH (a)-[:TYPE]-(b) RETURN a, b',
    example:'MATCH (p:Person)-[r:ACTED_IN]-(m:Movie) RETURN p, r, m LIMIT 20',
    proTip:'Bidirectional matching can double your results — use DISTINCT if needed.' },

  { id:'n4-27', group:'Pattern Matching', title:'Named Paths', difficulty:3,
    explanation:'Assign a path to a variable using p= to work with the full path object.',
    syntax:'MATCH p=(a)-[:REL*1..3]->(b) RETURN nodes(p), relationships(p)',
    example:'MATCH (m:Movie)-[r:BELONGS_TO]->(g:Genre) RETURN m, r, g LIMIT 20',
    proTip:'Use nodes(p) and relationships(p) to extract all nodes/rels from a named path.' },

  // GROUP 7: Aggregations
  { id:'n4-28', group:'Aggregations', title:'COUNT', difficulty:1,
    explanation:'COUNT counts rows or non-null values. COUNT(*) counts all rows; COUNT(n) excludes nulls.',
    syntax:'MATCH (n:Label) RETURN COUNT(n)',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) RETURN p.name, COUNT(m) AS movies ORDER BY movies DESC LIMIT 10',
    proTip:'COUNT(DISTINCT n.property) counts unique values — like SQL COUNT(DISTINCT col).' },

  { id:'n4-29', group:'Aggregations', title:'SUM and AVG', difficulty:2,
    explanation:'SUM totals numeric values; AVG computes the mean. Both ignore nulls.',
    syntax:'RETURN SUM(n.value), AVG(n.value)',
    example:'MATCH (m:Movie) RETURN COUNT(m) AS total, round(AVG(m.rating)*10)/10 AS avg_rating, MIN(m.released) AS oldest, MAX(m.released) AS newest',
    proTip:'Use round() to control decimal places: round(avg * 100) / 100.' },

  { id:'n4-30', group:'Aggregations', title:'COLLECT', difficulty:2,
    explanation:'COLLECT aggregates values into a list — like GROUP_CONCAT in SQL or array_agg in PostgreSQL.',
    syntax:'RETURN n.key, COLLECT(m.property) AS list',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) RETURN p.name, COLLECT(m.title) AS movies ORDER BY size(COLLECT(m.title)) DESC LIMIT 5',
    proTip:'COLLECT(DISTINCT x) removes duplicate values from the collected list.' },

  { id:'n4-31', group:'Aggregations', title:'size() Function', difficulty:1,
    explanation:'size() returns the number of elements in a list or the length of a string.',
    syntax:'RETURN n.name, size(list) AS count',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) WITH p, COLLECT(m) AS movies RETURN p.name, size(movies) AS movie_count ORDER BY movie_count DESC LIMIT 10',
    proTip:'Use size() on a COLLECT result to count relationships per node.' },

  { id:'n4-32', group:'Aggregations', title:'GROUP BY Pattern', difficulty:2,
    explanation:'Neo4j groups automatically when you mix non-aggregated and aggregated expressions in RETURN.',
    syntax:'MATCH pattern RETURN n.groupKey, COUNT(*), SUM(val)',
    example:'MATCH (m:Movie)-[:BELONGS_TO]->(g:Genre) RETURN g.name AS genre, COUNT(m) AS movies, round(AVG(m.rating)*10)/10 AS avg_rating ORDER BY movies DESC',
    proTip:'In Cypher, GROUP BY is implicit — any non-aggregated key in RETURN acts as the group key.' },

  // GROUP 8: Functions
  { id:'n4-33', group:'Functions', title:'String Functions', difficulty:2,
    explanation:'Cypher provides toLower(), toUpper(), trim(), split(), substring(), replace(), size() for string manipulation.',
    syntax:'RETURN toLower(n.name), toUpper(n.name), trim(n.name)',
    example:"MATCH (p:Person) RETURN p.name, toLower(p.name) AS lower_name, size(p.name) AS name_length, split(p.name, ' ')[0] AS first_name LIMIT 10",
    proTip:"split(str, ' ') returns a list — access elements with [0], [1]." },

  { id:'n4-34', group:'Functions', title:'Math Functions', difficulty:1,
    explanation:'abs(), round(), ceil(), floor(), sqrt(), log(), rand() — standard math functions.',
    syntax:'RETURN abs(n.val), round(n.val), ceil(n.val)',
    example:'MATCH (m:Movie) RETURN m.title, m.rating, round(m.rating) AS rounded, floor(m.rating) AS floored ORDER BY m.rating DESC LIMIT 10',
    proTip:'rand() returns a random float 0-1. Use it with ORDER BY rand() LIMIT n for random sampling.' },

  { id:'n4-35', group:'Functions', title:'Date Functions', difficulty:2,
    explanation:'date(), datetime(), duration() handle temporal data. date().year extracts components.',
    syntax:'RETURN date(), datetime(), duration({years: 1})',
    example:'MATCH (m:Movie) RETURN m.title, m.released, (date().year - m.released) AS years_ago ORDER BY years_ago LIMIT 10',
    proTip:'Store dates as native date() objects for range queries — not as strings.' },

  { id:'n4-36', group:'Functions', title:'List Functions', difficulty:2,
    explanation:'head(), tail(), last(), reverse(), range(), reduce() work on lists in Cypher.',
    syntax:'RETURN head(list), tail(list), range(1,10)',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) WITH p, COLLECT(m.title) AS movies RETURN p.name, head(movies) AS first_movie, size(movies) AS total ORDER BY total DESC LIMIT 10',
    proTip:'Use [x IN list WHERE condition] for list comprehension — very powerful for filtering lists.' },

  // GROUP 9: Advanced Cypher
  { id:'n4-37', group:'Advanced Cypher', title:'WITH Chaining', difficulty:3,
    explanation:'WITH passes results from one query part to the next — like a pipe. Enables multi-step queries.',
    syntax:'MATCH ... WITH n, count MATCH ... RETURN ...',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) WITH p, COUNT(m) AS cnt WHERE cnt >= 3 MATCH (p)-[:WON]->(a:Award) RETURN p.name, cnt AS movies, COUNT(a) AS awards ORDER BY awards DESC LIMIT 10',
    proTip:'WITH is required to use aggregated values in subsequent MATCH clauses.' },

  { id:'n4-38', group:'Advanced Cypher', title:'UNWIND', difficulty:3,
    explanation:'UNWIND expands a list into individual rows — the opposite of COLLECT. Like explode() in Spark.',
    syntax:'UNWIND [1,2,3] AS item RETURN item',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) WITH p, COLLECT(m.title) AS movies UNWIND movies AS movie RETURN p.name, movie LIMIT 10',
    proTip:'UNWIND is the inverse of COLLECT. Use together for flattening nested results.' },

  { id:'n4-39', group:'Advanced Cypher', title:'FOREACH', difficulty:3,
    explanation:'FOREACH iterates over a list to perform write operations (SET, CREATE, DELETE) on each element.',
    syntax:'FOREACH (item IN list | SET item.prop = val)',
    example:'MATCH p=(start:Person)-[:ACTED_IN*1..2]->(end:Movie) WITH nodes(p) AS nodeList FOREACH (n IN nodeList | SET n.visited = true) RETURN size(nodeList) LIMIT 1',
    proTip:'FOREACH is only for write operations inside the loop. For read operations, use list comprehension.' },

  { id:'n4-40', group:'Advanced Cypher', title:'CALL Subquery', difficulty:4,
    explanation:'CALL { } allows embedding a subquery with its own scope, useful for complex per-row operations.',
    syntax:'CALL { MATCH (n) RETURN n LIMIT 10 } RETURN n',
    example:'MATCH (g:Genre) CALL { WITH g MATCH (g)<-[:BELONGS_TO]-(m:Movie) RETURN COUNT(m) AS cnt } RETURN g.name, cnt ORDER BY cnt DESC',
    proTip:'CALL subqueries can import outer variables with WITH inside the subquery scope.' },

  { id:'n4-41', group:'Advanced Cypher', title:'DISTINCT', difficulty:1,
    explanation:'DISTINCT removes duplicate rows from results, just like SQL DISTINCT.',
    syntax:'MATCH (n)-[:REL]->(m) RETURN DISTINCT n.prop',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie)-[:BELONGS_TO]->(g:Genre) RETURN DISTINCT p.name, g.name ORDER BY p.name LIMIT 10',
    proTip:'DISTINCT is applied after RETURN — it de-duplicates the final result rows.' },

  // GROUP 10: Graph Algorithms
  { id:'n4-42', group:'Graph Algorithms', title:'Degree Centrality', difficulty:3,
    explanation:'Degree centrality = number of connections a node has. High degree = highly connected hub.',
    syntax:'MATCH (n)-[r]-() RETURN n, COUNT(r) AS degree ORDER BY degree DESC',
    example:'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) RETURN p, r, m LIMIT 25',
    proTip:'High-degree nodes in graph are "hubs" — actors who appear in the most movies.' },

  { id:'n4-43', group:'Graph Algorithms', title:'Common Connections', difficulty:3,
    explanation:'Find nodes that two entities have in common — the basis of recommendation engines.',
    syntax:'MATCH (a)-[:REL]->(x)<-[:REL]-(b) RETURN x',
    example:'MATCH (m:Movie)-[r:BELONGS_TO]->(g:Genre) RETURN m, r, g LIMIT 20',
    proTip:'This pattern finds co-stars. Add WHERE to exclude self-comparisons.' },

  { id:'n4-44', group:'Graph Algorithms', title:'Triangle Detection', difficulty:4,
    explanation:'A triangle is 3 nodes all connected to each other — indicates tight clustering.',
    syntax:'MATCH (a)-[:R]->(b)-[:R]->(c)-[:R]->(a) RETURN a,b,c',
    example:'MATCH (m1:Movie)<-[:ACTED_IN]-(p:Person)-[:ACTED_IN]->(m2:Movie) WHERE m1 <> m2 RETURN p.name, m1.title, m2.title LIMIT 10',
    proTip:'Triangle patterns are expensive — always filter first with WHERE to limit the search space.' },

  { id:'n4-45', group:'Graph Algorithms', title:'PageRank Concept', difficulty:4,
    explanation:'PageRank measures node importance based on its connections. In Neo4j GDS library: gds.pageRank.stream(). Here we approximate it.',
    syntax:'CALL gds.pageRank.stream(...)',
    example:'MATCH (p:Person)-[r:ACTED_IN]->(m:Movie) WITH p, COUNT(r) AS connections, SUM(m.rating) AS weighted RETURN p.name, connections, round(weighted/connections*10)/10 AS influence ORDER BY influence DESC LIMIT 10',
    proTip:'Install the Neo4j Graph Data Science (GDS) plugin for full PageRank, betweenness, and Louvain algorithms.' },

  // GROUP 11: Practical Patterns
  { id:'n4-46', group:'Practical Patterns', title:'Recommendation Query', difficulty:3,
    explanation:'Collaborative filtering: "People who watched X also watched Y" — the foundation of recommendation systems.',
    syntax:'MATCH (u)-[:LIKED]->(i)<-[:LIKED]-(other)-[:LIKED]->(rec) RETURN rec',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m1:Movie)<-[:ACTED_IN]-(costar:Person)-[:ACTED_IN]->(m2:Movie) WHERE p.name = "James Smith" AND m2 <> m1 RETURN DISTINCT m2.title AS recommended, COUNT(costar) AS co_stars ORDER BY co_stars DESC LIMIT 10',
    proTip:'This is a 4-hop pattern. Always profile and add indexes for production use.' },

  { id:'n4-47', group:'Practical Patterns', title:'Friend-of-Friend', difficulty:3,
    explanation:'Find second-degree connections — people connected to your connections.',
    syntax:'MATCH (a)-[:KNOWS]->(b)-[:KNOWS]->(c) WHERE a <> c RETURN c',
    example:'MATCH (p1:Person)-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(p2:Person)-[:DIRECTED]->(m2:Movie) WHERE p1.name <> p2.name RETURN p1.name, p2.name, m2.title LIMIT 10',
    proTip:'Always add WHERE a <> c to exclude the start node from results.' },

  { id:'n4-48', group:'Practical Patterns', title:'Path Finding', difficulty:3,
    explanation:'Find how nodes are connected through multi-hop paths.',
    syntax:'MATCH path=(a)-[*1..4]-(b) RETURN nodes(path)',
    example:'MATCH (g:Genre {name: "Action"}) MATCH path=(g)<-[:BELONGS_TO]-(m:Movie)<-[:ACTED_IN]-(p:Person) RETURN g.name, m.title, p.name ORDER BY m.rating DESC LIMIT 10',
    proTip:'Use EXPLAIN or PROFILE to check query performance before running on full dataset.' },

  { id:'n4-49', group:'Practical Patterns', title:'Graph Traversal', difficulty:3,
    explanation:'Traverse multiple relationship types to find paths through the graph.',
    syntax:'MATCH (start)-[:R1|R2*1..3]->(end) RETURN end',
    example:'MATCH (s:Studio)<-[:PRODUCED_BY]-(m:Movie)-[:BELONGS_TO]->(g:Genre) RETURN s.name AS studio, g.name AS genre, COUNT(m) AS movies ORDER BY movies DESC LIMIT 10',
    proTip:'The more relationship types you chain, the more selective you should be with WHERE filters.' },

  { id:'n4-50', group:'Practical Patterns', title:'Aggregated Insights', difficulty:2,
    explanation:'Combine multiple aggregations to extract meaningful insights from the graph.',
    syntax:'MATCH patterns WITH aggregations RETURN analytics',
    example:'MATCH (p:Person)-[:ACTED_IN]->(m:Movie) WITH m, COLLECT(p.name) AS cast, COUNT(p) AS cast_size RETURN m.title, cast_size, m.rating ORDER BY cast_size DESC, m.rating DESC LIMIT 10',
    proTip:'This pattern — aggregate then sort — is the workhorse of graph analytics queries.' },
];

// Quiz data for all DB topics — 3 questions each
export const quizData = {

  // ── POSTGRES ──────────────────────────────────────────────────────
  'postgres-SELECT Basics': [
    { q: 'Which keyword retrieves data from a table?', opts: ['GET','SELECT','FETCH','PULL'], ans: 1, exp: 'SELECT is standard SQL for querying data.' },
    { q: 'Find the bug: SELECT * FROM users LIMIT = 5;', opts: ['Missing semicolon','LIMIT = 5 is wrong — should be LIMIT 5','* is invalid','FROM is misspelled'], ans: 1, exp: 'LIMIT does not use =. Write: LIMIT 5.' },
    { q: 'How do you select only the name and email columns?', opts: ['SELECT all FROM users','SELECT name, email FROM users','GET name, email FROM users','SELECT users.name users.email'], ans: 1, exp: 'List column names separated by commas after SELECT.' },
  ],
  'postgres-Filtering': [
    { q: 'Which operator checks if a value is in a list?', opts: ['CONTAINS','BETWEEN','IN','LIKE'], ans: 2, exp: 'IN checks if a value matches any value in a list.' },
    { q: 'What does % mean in a LIKE pattern?', opts: ['Exactly one char','Any sequence of chars','A number','Nothing — it is invalid'], ans: 1, exp: '% matches any sequence of zero or more characters.' },
    { q: 'How do you check for missing values?', opts: ['= NULL','== NULL','IS NULL','NULL = true'], ans: 2, exp: 'NULL comparisons always use IS NULL or IS NOT NULL.' },
  ],
  'postgres-Aggregations': [
    { q: 'Which function counts rows including NULLs?', opts: ['COUNT(column)','COUNT(*)','SUM(*)','TOTAL(*)'], ans: 1, exp: 'COUNT(*) counts all rows; COUNT(col) skips NULLs.' },
    { q: 'What does AVG() ignore?', opts: ['Zeros','Negative numbers','NULL values','Duplicates'], ans: 2, exp: 'All aggregate functions ignore NULL values by default.' },
    { q: 'Which finds the highest price?', opts: ['HIGHEST(price)','MAX(price)','TOP(price)','CEILING(price)'], ans: 1, exp: 'MAX() returns the largest value in a column.' },
  ],
  'postgres-GROUP BY & HAVING': [
    { q: 'What is the difference between WHERE and HAVING?', opts: ['None','WHERE filters rows, HAVING filters groups','HAVING filters rows, WHERE filters groups','WHERE is faster'], ans: 1, exp: 'WHERE runs before grouping; HAVING runs after GROUP BY.' },
    { q: 'Every SELECT column must appear in GROUP BY unless it is...', opts: ['Indexed','An aggregate function','A primary key','Uppercase'], ans: 1, exp: 'Non-aggregated columns must be in GROUP BY.' },
    { q: 'Find the bug: SELECT status, COUNT(*) FROM orders HAVING COUNT(*) > 100;', opts: ['COUNT is wrong','Missing GROUP BY status','HAVING syntax error','No bug'], ans: 1, exp: 'HAVING requires GROUP BY to define the groups.' },
  ],
  'postgres-Joins': [
    { q: 'Which join returns only matching rows from both tables?', opts: ['LEFT JOIN','RIGHT JOIN','INNER JOIN','FULL JOIN'], ans: 2, exp: 'INNER JOIN keeps only rows with matches in both tables.' },
    { q: 'LEFT JOIN returns unmatched right-table columns as...', opts: ['0','Empty string','NULL','Skipped'], ans: 2, exp: 'Non-matching columns from the right table return NULL.' },
    { q: 'To join a table to itself you need...', opts: ['Two different databases','Table aliases','A foreign key to itself','UNION'], ans: 1, exp: 'Self joins require aliases to distinguish the two instances.' },
  ],
  'postgres-Subqueries': [
    { q: 'A subquery in FROM must always have a...', opts: ['WHERE clause','LIMIT','Alias','Primary key'], ans: 2, exp: 'Derived tables (subqueries in FROM) must be aliased.' },
    { q: 'EXISTS returns TRUE when the subquery returns...', opts: ['A number','At least one row','Exactly one row','NULL'], ans: 1, exp: 'EXISTS only checks whether any row is returned.' },
    { q: 'Which is faster for large datasets — IN or EXISTS?', opts: ['Always IN','Always EXISTS','Depends on the query','They are identical'], ans: 2, exp: 'EXISTS is often faster when the subquery returns many rows.' },
  ],
  'postgres-INSERT': [
    { q: 'How do you get the auto-generated ID after INSERT?', opts: ['SELECT LAST_INSERT_ID()','Use RETURNING *','Check pg_sequence','Query the table again'], ans: 1, exp: 'PostgreSQL RETURNING clause returns inserted row data.' },
    { q: 'INSERT … SELECT copies data from...', opts: ['A file','Another query result','A variable','A JSON object'], ans: 1, exp: 'INSERT … SELECT inserts rows produced by a SELECT query.' },
    { q: 'ON CONFLICT DO NOTHING handles what situation?', opts: ['Table locks','Duplicate key violations','NULL constraints','Syntax errors'], ans: 1, exp: 'ON CONFLICT handles unique constraint violations gracefully.' },
  ],
  'postgres-UPDATE': [
    { q: 'What happens if you omit WHERE from UPDATE?', opts: ['Nothing happens','Only first row updates','All rows are updated','Error is thrown'], ans: 2, exp: 'UPDATE without WHERE modifies every row in the table.' },
    { q: 'PostgreSQL UPDATE … FROM lets you join...', opts: ['Only one table','Multiple tables for the source','Only CTEs','Only subqueries'], ans: 1, exp: 'UPDATE … FROM allows joining another table to set values.' },
    { q: 'RETURNING in UPDATE gives you...', opts: ['Old values','New values after update','Row count only','An error'], ans: 1, exp: 'RETURNING returns the state of rows after the update.' },
  ],
  'postgres-DELETE': [
    { q: 'What is the safest way to test a DELETE before running it?', opts: ['Use TRUNCATE first','Run SELECT with the same WHERE first','Use DROP TABLE','No way to test'], ans: 1, exp: 'Always test your WHERE filter with SELECT before DELETE.' },
    { q: 'TRUNCATE vs DELETE — which is faster for clearing a table?', opts: ['DELETE','TRUNCATE','They are the same','Depends on OS'], ans: 1, exp: 'TRUNCATE resets storage directly without scanning rows.' },
    { q: 'DELETE with a subquery uses which clause?', opts: ['JOIN','WHERE id IN (SELECT...)','FROM subquery','USING'], ans: 1, exp: 'WHERE col IN (subquery) is the most common pattern.' },
  ],
  'postgres-Functions': [
    { q: 'How do you concatenate strings in PostgreSQL?', opts: ['+ operator','CONCAT() or ||','& operator','JOIN()'], ans: 1, exp: 'Both CONCAT() function and || operator work for strings.' },
    { q: 'Which function returns current timestamp?', opts: ['TODAY()','CURRENT()','NOW()','GETDATE()'], ans: 2, exp: 'NOW() returns the current date and time with timezone.' },
    { q: 'COALESCE(NULL, NULL, 5) returns...', opts: ['NULL','0','5','Error'], ans: 2, exp: 'COALESCE returns the first non-NULL value in the list.' },
  ],
  'postgres-Advanced': [
    { q: 'A CTE is defined with which keyword?', opts: ['DEFINE','WITH','LET','AS'], ans: 1, exp: 'WITH cte_name AS (SELECT ...) defines a Common Table Expression.' },
    { q: 'Window functions use which clause to define the window?', opts: ['GROUP BY','PARTITION','OVER','WINDOW'], ans: 2, exp: 'OVER() defines the window frame for the function.' },
    { q: 'EXPLAIN shows...', opts: ['Query results','Execution plan','Index list','Table schema'], ans: 1, exp: 'EXPLAIN shows how PostgreSQL plans to execute a query.' },
  ],

  // ── MONGODB ───────────────────────────────────────────────────────
  'mongo-Find Basics': [
    { q: 'How do you return all documents from a collection?', opts: ['db.col.getAll()','db.col.find({})','db.col.select(*)','db.col.fetch()'], ans: 1, exp: 'find({}) with an empty filter returns all documents.' },
    { q: 'Projection { name: 1, _id: 0 } means...', opts: ['Include _id only','Include name, exclude _id','Exclude name','Include everything'], ans: 1, exp: '1 includes the field; 0 excludes it. _id is excluded explicitly.' },
    { q: 'findOne() returns how many documents?', opts: ['All matches','First match only','Last match','Random match'], ans: 1, exp: 'findOne() always returns at most one document.' },
  ],
  'mongo-Query Operators': [
    { q: 'What is the shorthand for { field: { $eq: value } }?', opts: ['{ field == value }','{ field: value }','{ field === value }','No shorthand'], ans: 1, exp: '{ field: value } is shorthand for equality matching.' },
    { q: 'Which operator matches if field is in an array of values?', opts: ['$contains','$in','$any','$includes'], ans: 1, exp: '$in: [v1, v2] matches any document where field equals v1 or v2.' },
    { q: '$exists: false finds documents where...', opts: ['Field is null','Field is empty','Field is absent','Field is false'], ans: 2, exp: '$exists: false finds docs where the field is not present at all.' },
  ],
  'mongo-Insert': [
    { q: 'MongoDB auto-creates a collection when you...', opts: ['Run createCollection()','Insert the first document','Create an index','Connect to the database'], ans: 1, exp: 'Collections are created implicitly on first insert.' },
    { q: 'What does upsert: true do?', opts: ['Updates only','Inserts only','Updates if exists, inserts if not','Throws error on duplicate'], ans: 2, exp: 'Upsert = update OR insert, depending on whether a match exists.' },
    { q: 'insertMany with ordered: false...', opts: ['Stops on first error','Continues inserting after errors','Reverses order','Has no effect'], ans: 1, exp: 'ordered: false continues processing remaining documents on error.' },
  ],
  'mongo-Update': [
    { q: 'Without $set in updateOne(), what happens?', opts: ['Only listed fields update','The entire document is replaced','Error is thrown','Nothing changes'], ans: 1, exp: 'Updating without $set replaces the full document (except _id).' },
    { q: '$inc: { count: -1 } does what?', opts: ['Sets count to -1','Decrements count by 1','Multiplies by -1','Removes count'], ans: 1, exp: '$inc with a negative value decrements the field.' },
    { q: '$addToSet vs $push — the difference is?', opts: ['No difference','$addToSet prevents duplicates','$push prevents duplicates','$addToSet is faster'], ans: 1, exp: '$addToSet only adds if the value is not already in the array.' },
  ],
  'mongo-Delete': [
    { q: 'deleteMany({}) deletes...', opts: ['Nothing','The collection','All documents','Only first document'], ans: 2, exp: 'An empty filter {} matches all documents in the collection.' },
    { q: 'findOneAndDelete() returns...', opts: ['Count of deleted docs','The deleted document','true/false','Nothing'], ans: 1, exp: 'It atomically finds, removes, and returns the deleted document.' },
    { q: 'Fastest way to remove all documents from a collection?', opts: ['deleteMany({})','drop() then recreate','TRUNCATE','remove()'], ans: 1, exp: 'drop() removes the entire collection, then recreate. Faster than deleteMany({}).' },
  ],
  'mongo-Aggregation Pipeline': [
    { q: 'Which stage should come first for performance?', opts: ['$group','$sort','$match','$project'], ans: 2, exp: '$match first reduces documents early, using indexes.' },
    { q: '$lookup is equivalent to which SQL operation?', opts: ['UNION','GROUP BY','JOIN','HAVING'], ans: 2, exp: '$lookup performs a left outer join with another collection.' },
    { q: 'UNWIND expands...', opts: ['Objects into key-value pairs','Arrays into individual documents','Groups into subgroups','Documents into fields'], ans: 1, exp: '$unwind deconstructs an array so each element becomes a row.' },
  ],
  'mongo-Array Operations': [
    { q: '$elemMatch is needed when...', opts: ['Matching arrays by size','Multiple conditions must match ONE array element','Querying nested objects','Sorting arrays'], ans: 1, exp: 'Without $elemMatch, conditions can match different array elements.' },
    { q: '$size: 3 matches arrays with...', opts: ['At least 3 elements','At most 3 elements','Exactly 3 elements','More than 3 elements'], ans: 2, exp: '$size only matches the exact array length.' },
    { q: '$all matches arrays that contain...', opts: ['Any of the values','All of the values','None of the values','Only those values'], ans: 1, exp: '$all requires all specified values to be present in the array.' },
  ],
  'mongo-Indexes': [
    { q: 'What does COLLSCAN in explain() mean?', opts: ['Collection is healthy','Full collection scan — no index used','Clustered collection','Scan limit applied'], ans: 1, exp: 'COLLSCAN means MongoDB scanned every document without an index.' },
    { q: 'A text index enables which operator?', opts: ['$contains','$text','$regex','$search'], ans: 1, exp: '$text operator works only on collections with a text index.' },
    { q: 'How many text indexes can a collection have?', opts: ['Unlimited','1','10','As many as fields'], ans: 1, exp: 'MongoDB allows only one text index per collection.' },
  ],
  'mongo-Schema Design': [
    { q: 'Embedding is preferred when data...', opts: ['Is always updated separately','Is large and unbounded','Is always accessed together','Is shared across many documents'], ans: 2, exp: 'Embed when you always fetch the related data with the parent.' },
    { q: 'MongoDB auto-creates _id as...', opts: ['Integer','UUID','ObjectId','String'], ans: 2, exp: 'The default _id type is ObjectId, a 12-byte unique identifier.' },
    { q: 'JSON Schema validation is set at the...', opts: ['Field level only','Document level','Database level','Index level'], ans: 1, exp: 'Validation rules are defined per collection when creating it.' },
  ],
  'mongo-Practical': [
    { q: 'Cursor-based pagination uses which field?', opts: ['skip()','page number','Last seen _id','offset'], ans: 2, exp: 'Querying WHERE _id > lastSeenId is faster than skip() at scale.' },
    { q: 'countDocuments() vs estimatedDocumentCount() — which is faster?', opts: ['countDocuments','estimatedDocumentCount','Same speed','Depends on index'], ans: 1, exp: 'estimatedDocumentCount() reads metadata, O(1). countDocuments scans.' },
    { q: 'distinct() returns...', opts: ['One document','An array of unique values','A cursor','Count of unique values'], ans: 1, exp: 'distinct() returns an array of all unique values for a field.' },
  ],

  // ── NEO4J ─────────────────────────────────────────────────────────
  'neo4j-MATCH Basics': [
    { q: 'What does (n) represent in a Cypher pattern?', opts: ['A relationship','Any node','A property','A label'], ans: 1, exp: '(n) is a node pattern — n is the variable, any type.' },
    { q: 'How do you filter by label in MATCH?', opts: ['MATCH (n) WHERE type=Label','MATCH (n:Label)','MATCH (n)[Label]','MATCH Label(n)'], ans: 1, exp: 'Labels use colon notation: (n:Movie).' },
    { q: 'Which arrow shows a directed relationship?', opts: ['(a)-[r]-(b)','(a)-[r]->(b)','(a)-->(b) only','(a)<r>(b)'], ans: 1, exp: '-[r]-> shows direction. Omit the arrow for undirected.' },
  ],
  'neo4j-Filtering': [
    { q: 'Which string operator is case-sensitive by default?', opts: ['LIKE','ILIKE','CONTAINS','$regex'], ans: 2, exp: 'CONTAINS (and STARTS WITH, ENDS WITH) are case-sensitive in Cypher.' },
    { q: '(n {country: "USA"}) is equivalent to...', opts: ['MATCH (n) RETURN n.country','MATCH (n) WHERE n.country = "USA"','MATCH (n) FILTER country','MATCH (n:USA)'], ans: 1, exp: 'Inline property matching is shorthand for WHERE equality.' },
    { q: 'To match multiple relationship types use...', opts: ['AND between types','Comma separator','Pipe | separator','Multiple MATCH clauses'], ans: 2, exp: '-[:TYPE1|TYPE2]-> matches either relationship type.' },
  ],
  'neo4j-CREATE': [
    { q: 'CREATE always creates a node even if one exists. To avoid duplicates use...', opts: ['CREATE IF NOT EXISTS','MERGE','INSERT OR IGNORE','UNIQUE CREATE'], ans: 1, exp: 'MERGE matches existing or creates new — prevents duplicates.' },
    { q: 'To create a relationship you must first...', opts: ['Create both nodes','MATCH both nodes','Use CREATE PATH','Define a schema'], ans: 1, exp: 'Both nodes must exist (via MATCH or CREATE) before linking them.' },
    { q: 'ON CREATE SET runs...', opts: ['Always','Only when MERGE creates a new node','Only when MERGE matches','On every SET'], ans: 1, exp: 'ON CREATE SET only executes when MERGE creates a new node.' },
  ],
  'neo4j-UPDATE': [
    { q: 'SET n = {map} vs SET n += {map} — difference?', opts: ['No difference','= replaces all props; += merges','= merges; += replaces','= is faster'], ans: 1, exp: 'n = {} replaces ALL properties. n += {} only adds/updates specified ones.' },
    { q: 'REMOVE n.property does what?', opts: ['Sets it to null','Deletes the property entirely','Hides it from queries','Marks it deprecated'], ans: 1, exp: 'REMOVE truly deletes the property from the node.' },
    { q: 'To add a label to an existing node use...', opts: ['UPDATE n ADD :Label','SET n:NewLabel','MERGE (n:NewLabel)','ALTER n ADD LABEL'], ans: 1, exp: 'SET n:Label adds a label to any matched node.' },
  ],
  'neo4j-DELETE': [
    { q: 'DELETE on a node with relationships throws an error. Fix with...', opts: ['FORCE DELETE','DETACH DELETE','CASCADE DELETE','REMOVE DELETE'], ans: 1, exp: 'DETACH DELETE removes the node and all its relationships.' },
    { q: 'To delete only a relationship (keep both nodes)...', opts: ['MATCH (a)-[r]->(b) DELETE r','DELETE RELATIONSHIP r','REMOVE r','DETACH r'], ans: 0, exp: 'Match the relationship to a variable [r] then DELETE r.' },
    { q: 'DETACH DELETE n removes...', opts: ['Only the node','The node and its relationships','All nodes with same label','The database'], ans: 1, exp: 'DETACH DELETE removes the node AND all connected relationships.' },
  ],
  'neo4j-Pattern Matching': [
    { q: 'OPTIONAL MATCH is like which SQL join?', opts: ['INNER JOIN','LEFT JOIN','CROSS JOIN','FULL JOIN'], ans: 1, exp: 'OPTIONAL MATCH returns NULL for missing patterns, like LEFT JOIN.' },
    { q: 'Variable-length path (a)-[:R*2..4]->(b) means...', opts: ['Exactly 2 hops','Between 2 and 4 hops','At least 4 hops','2 or 4 hops only'], ans: 1, exp: '*min..max specifies the range of relationship hops.' },
    { q: 'shortestPath() finds...', opts: ['All paths','The path with fewest hops','The cheapest path','A random path'], ans: 1, exp: 'shortestPath() returns the path with the minimum number of hops.' },
  ],
  'neo4j-Aggregations': [
    { q: 'COLLECT() is similar to which SQL function?', opts: ['GROUP_BY','array_agg / GROUP_CONCAT','SUM','DISTINCT'], ans: 1, exp: 'COLLECT aggregates values into a list — like array_agg in PostgreSQL.' },
    { q: 'In Cypher, GROUP BY is...', opts: ['An explicit keyword','Implicit when mixing aggregated and non-aggregated in RETURN','Not supported','Required after MATCH'], ans: 1, exp: 'Cypher groups automatically — no GROUP BY keyword needed.' },
    { q: 'COUNT(DISTINCT n.property) counts...', opts: ['All values','Unique non-null values','All rows','Null values only'], ans: 1, exp: 'DISTINCT inside COUNT removes duplicates before counting.' },
  ],
  'neo4j-Functions': [
    { q: 'How do you get the first name from "James Smith"?', opts: ["split(name, ' ')[1]","split(name, ' ')[0]",'head(name)','left(name, 5)'], ans: 1, exp: "split(n.name, ' ') returns a list; [0] gets the first element." },
    { q: 'rand() returns...', opts: ['A random integer','A random float between 0 and 1','A random node','A random list'], ans: 1, exp: 'rand() returns a random float in [0.0, 1.0).' },
    { q: 'head([1,2,3]) returns...', opts: ['3','[1,2]','1','null'], ans: 2, exp: 'head() returns the first element of a list.' },
  ],
  'neo4j-Advanced Cypher': [
    { q: 'WITH in Cypher acts like a...', opts: ['Filter','Pipe — passes results to next query part','Join','Alias'], ans: 1, exp: 'WITH passes results forward and allows further processing.' },
    { q: 'UNWIND is the opposite of...', opts: ['WITH','COLLECT','MATCH','RETURN'], ans: 1, exp: 'UNWIND expands a list; COLLECT creates a list.' },
    { q: 'FOREACH is used for...', opts: ['Reading data','Write operations on list elements','Filtering','Returning data'], ans: 1, exp: 'FOREACH is for write operations (SET, CREATE, DELETE) in a loop.' },
  ],
  'neo4j-Graph Algorithms': [
    { q: 'Degree centrality measures...', opts: ['Node age','Number of connections a node has','Distance between nodes','Graph density'], ans: 1, exp: 'High-degree nodes are hubs — highly connected in the graph.' },
    { q: 'PageRank is available in...', opts: ['Core Cypher','Neo4j GDS plugin','Bolt protocol','APOC library'], ans: 1, exp: 'PageRank and other algorithms are in the Graph Data Science library.' },
    { q: 'A triangle in a graph means...', opts: ['3 unconnected nodes','3 nodes all connected to each other','A path of 3 hops','3 relationship types'], ans: 1, exp: 'Triangles indicate tight clusters — all 3 nodes know each other.' },
  ],
  'neo4j-Practical Patterns': [
    { q: 'The "people who liked X also liked Y" pattern is called...', opts: ['Graph traversal','Collaborative filtering','Degree centrality','Path finding'], ans: 1, exp: 'Collaborative filtering is the foundation of recommendation engines.' },
    { q: 'Friend-of-friend queries use how many hops?', opts: ['1','2','3','Unlimited'], ans: 1, exp: '2-hop pattern: (you)-[:KNOWS]->(friend)-[:KNOWS]->(fof).' },
    { q: 'PROFILE vs EXPLAIN — difference?', opts: ['No difference','PROFILE actually runs the query; EXPLAIN does not','EXPLAIN runs; PROFILE does not','Both run the query'], ans: 1, exp: 'PROFILE executes the query and shows real stats; EXPLAIN just shows the plan.' },
  ],
};

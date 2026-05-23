export const postgresLessons = [
  // ── GROUP 1: SELECT Basics ──────────────────────────────────────
  { id:'pg-1', group:'SELECT Basics', title:'SELECT All Columns', difficulty:1,
    explanation:'The SELECT statement retrieves data from a table. Using * selects every column. This is the most fundamental SQL command — every query starts here.',
    syntax:'SELECT * FROM table_name;',
    example:'SELECT * FROM ecom_users LIMIT 5;',
    proTip:'Avoid SELECT * in production — always name your columns explicitly for performance and clarity.' },

  { id:'pg-2', group:'SELECT Basics', title:'SELECT Specific Columns', difficulty:1,
    explanation:'Instead of fetching all columns, you can list only the ones you need. This reduces data transfer and makes results easier to read.',
    syntax:'SELECT col1, col2 FROM table_name;',
    example:'SELECT name, email, country FROM ecom_users LIMIT 10;',
    proTip:'Aliasing with AS makes output cleaner: SELECT name AS customer_name.' },

  { id:'pg-3', group:'SELECT Basics', title:'WHERE Clause', difficulty:1,
    explanation:'WHERE filters rows that match a condition. Only rows where the condition is TRUE are returned.',
    syntax:'SELECT * FROM table_name WHERE condition;',
    example:"SELECT * FROM ecom_users WHERE country = 'USA' LIMIT 10;",
    proTip:'String comparisons are case-sensitive in PostgreSQL by default. Use ILIKE for case-insensitive.' },

  { id:'pg-4', group:'SELECT Basics', title:'ORDER BY', difficulty:1,
    explanation:'ORDER BY sorts query results. ASC (default) sorts ascending, DESC sorts descending. You can sort by multiple columns.',
    syntax:'SELECT * FROM table_name ORDER BY column ASC|DESC;',
    example:'SELECT name, price FROM products ORDER BY price DESC LIMIT 10;',
    proTip:'NULLs sort last with ASC and first with DESC by default in PostgreSQL.' },

  { id:'pg-5', group:'SELECT Basics', title:'LIMIT & OFFSET', difficulty:1,
    explanation:'LIMIT caps the number of rows returned. OFFSET skips rows — together they enable pagination.',
    syntax:'SELECT * FROM table_name LIMIT n OFFSET m;',
    example:'SELECT name, price FROM products ORDER BY id LIMIT 5 OFFSET 10;',
    proTip:'Always use ORDER BY with LIMIT/OFFSET — without it, result order is unpredictable.' },

  // ── GROUP 2: Filtering ──────────────────────────────────────────
  { id:'pg-6', group:'Filtering', title:'AND / OR / NOT', difficulty:1,
    explanation:'Combine multiple conditions. AND requires both true, OR requires at least one true, NOT inverts the condition.',
    syntax:'WHERE condition1 AND condition2\nWHERE condition1 OR condition2',
    example:"SELECT * FROM ecom_users WHERE country = 'USA' AND is_premium = true LIMIT 10;",
    proTip:'Use parentheses to control precedence: WHERE (a OR b) AND c.' },

  { id:'pg-7', group:'Filtering', title:'IN Operator', difficulty:1,
    explanation:'IN checks if a value matches any value in a list. It is a cleaner alternative to multiple OR conditions.',
    syntax:'WHERE column IN (value1, value2, ...)',
    example:"SELECT * FROM orders WHERE status IN ('delivered','shipped') LIMIT 10;",
    proTip:'NOT IN also works. Be careful — NOT IN with a subquery that returns NULLs returns no rows.' },

  { id:'pg-8', group:'Filtering', title:'BETWEEN', difficulty:1,
    explanation:'BETWEEN tests if a value is within an inclusive range. Works on numbers, dates, and strings.',
    syntax:'WHERE column BETWEEN low AND high',
    example:'SELECT * FROM products WHERE price BETWEEN 50 AND 200 LIMIT 10;',
    proTip:'BETWEEN is inclusive on both ends. Equivalent to col >= low AND col <= high.' },

  { id:'pg-9', group:'Filtering', title:'LIKE Pattern Matching', difficulty:2,
    explanation:'LIKE matches string patterns. % matches any sequence of characters, _ matches exactly one character. ILIKE is case-insensitive.',
    syntax:"WHERE column LIKE 'pattern%'",
    example:"SELECT name, email FROM ecom_users WHERE email LIKE '%@gmail%' LIMIT 10;",
    proTip:'LIKE with a leading % (e.g. %term) cannot use an index. For full-text search, use PostgreSQL tsvector.' },

  { id:'pg-10', group:'Filtering', title:'IS NULL / IS NOT NULL', difficulty:1,
    explanation:'NULL represents missing data. You cannot use = NULL — you must use IS NULL or IS NOT NULL.',
    syntax:'WHERE column IS NULL\nWHERE column IS NOT NULL',
    example:'SELECT * FROM payments WHERE paid_at IS NULL LIMIT 10;',
    proTip:'Use COALESCE(column, default_value) to substitute a fallback when a value is NULL.' },

  // ── GROUP 3: Aggregations ───────────────────────────────────────
  { id:'pg-11', group:'Aggregations', title:'COUNT', difficulty:1,
    explanation:'COUNT(*) counts all rows. COUNT(column) counts non-NULL values in that column.',
    syntax:'SELECT COUNT(*) FROM table_name;',
    example:'SELECT COUNT(*) AS total_users FROM ecom_users;',
    proTip:'COUNT(DISTINCT column) counts unique values — e.g. COUNT(DISTINCT country).' },

  { id:'pg-12', group:'Aggregations', title:'SUM', difficulty:1,
    explanation:'SUM adds up all values in a numeric column. Ignores NULLs.',
    syntax:'SELECT SUM(column) FROM table_name;',
    example:'SELECT SUM(total) AS total_revenue FROM orders;',
    proTip:'ROUND(SUM(price)::numeric, 2) formats the result to 2 decimal places.' },

  { id:'pg-13', group:'Aggregations', title:'AVG', difficulty:1,
    explanation:'AVG calculates the arithmetic mean of a column. NULLs are excluded from the calculation.',
    syntax:'SELECT AVG(column) FROM table_name;',
    example:'SELECT ROUND(AVG(price)::numeric, 2) AS avg_price FROM products;',
    proTip:'AVG returns a numeric type in PostgreSQL. Cast with ::numeric before ROUND for clean decimals.' },

  { id:'pg-14', group:'Aggregations', title:'MIN & MAX', difficulty:1,
    explanation:'MIN finds the smallest value, MAX finds the largest. Both work on numbers, dates, and strings.',
    syntax:'SELECT MIN(col), MAX(col) FROM table_name;',
    example:'SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive FROM products;',
    proTip:'These also work on strings (alphabetical order) and dates (earliest/latest).' },

  { id:'pg-15', group:'Aggregations', title:'Multiple Aggregates', difficulty:2,
    explanation:'You can combine multiple aggregate functions in a single query to get a statistical summary.',
    syntax:'SELECT COUNT(*), SUM(col), AVG(col), MIN(col), MAX(col) FROM table;',
    example:'SELECT COUNT(*) AS orders, SUM(total) AS revenue, ROUND(AVG(total)::numeric,2) AS avg_order FROM orders;',
    proTip:'This pattern is very common in analytics dashboards and reporting queries.' },

  // ── GROUP 4: GROUP BY & HAVING ──────────────────────────────────
  { id:'pg-16', group:'GROUP BY & HAVING', title:'GROUP BY', difficulty:2,
    explanation:'GROUP BY groups rows that share a value in one or more columns, then applies aggregate functions per group.',
    syntax:'SELECT col, COUNT(*) FROM table GROUP BY col;',
    example:'SELECT country, COUNT(*) AS users FROM ecom_users GROUP BY country ORDER BY users DESC;',
    proTip:'Every column in SELECT (not in an aggregate function) must appear in GROUP BY.' },

  { id:'pg-17', group:'GROUP BY & HAVING', title:'HAVING', difficulty:2,
    explanation:'HAVING filters groups after GROUP BY — like WHERE but for aggregated results.',
    syntax:'SELECT col, COUNT(*) FROM table GROUP BY col HAVING COUNT(*) > n;',
    example:"SELECT status, COUNT(*) FROM orders GROUP BY status HAVING COUNT(*) > 500;",
    proTip:'WHERE filters rows before grouping; HAVING filters groups after aggregation.' },

  { id:'pg-18', group:'GROUP BY & HAVING', title:'GROUP BY Multiple Columns', difficulty:2,
    explanation:'You can group by more than one column to create multi-dimensional aggregations.',
    syntax:'SELECT col1, col2, COUNT(*) FROM table GROUP BY col1, col2;',
    example:'SELECT country, is_premium, COUNT(*) FROM ecom_users GROUP BY country, is_premium ORDER BY country;',
    proTip:'The order of GROUP BY columns does not affect results but matters for readability.' },

  { id:'pg-19', group:'GROUP BY & HAVING', title:'ROLLUP for Subtotals', difficulty:3,
    explanation:'ROLLUP creates subtotals and grand totals. It generates grouping sets at multiple levels of aggregation.',
    syntax:'SELECT col1, col2, SUM(val) FROM table GROUP BY ROLLUP(col1, col2);',
    example:"SELECT status, COUNT(*) FROM orders GROUP BY ROLLUP(status) ORDER BY status NULLS LAST;",
    proTip:'NULL in a ROLLUP result represents the subtotal/grand total row, not missing data.' },

  // ── GROUP 5: JOINs ──────────────────────────────────────────────
  { id:'pg-20', group:'Joins', title:'INNER JOIN', difficulty:2,
    explanation:'INNER JOIN returns only rows that have matching values in both tables. Non-matching rows are excluded.',
    syntax:'SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.fk_id;',
    example:'SELECT o.id, u.name, o.total FROM orders o INNER JOIN ecom_users u ON o.user_id = u.id LIMIT 10;',
    proTip:'INNER JOIN is the most common and fastest join type. Always index your foreign keys.' },

  { id:'pg-21', group:'Joins', title:'LEFT JOIN', difficulty:2,
    explanation:'LEFT JOIN returns all rows from the left table and matching rows from the right. Non-matching right rows get NULL values.',
    syntax:'SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.fk_id;',
    example:'SELECT u.name, COUNT(o.id) AS order_count FROM ecom_users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY order_count DESC LIMIT 10;',
    proTip:'Use LEFT JOIN to find rows with NO matches: WHERE t2.id IS NULL.' },

  { id:'pg-22', group:'Joins', title:'RIGHT JOIN', difficulty:2,
    explanation:'RIGHT JOIN returns all rows from the right table and matching rows from the left. The mirror of LEFT JOIN.',
    syntax:'SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.fk_id;',
    example:'SELECT p.name, c.name AS category FROM products p RIGHT JOIN ecom_categories c ON p.category_id = c.id LIMIT 10;',
    proTip:'Most developers prefer LEFT JOIN and swap table order instead of using RIGHT JOIN for readability.' },

  { id:'pg-23', group:'Joins', title:'FULL OUTER JOIN', difficulty:3,
    explanation:'FULL JOIN returns all rows from both tables. Rows without a match on either side get NULLs for the other table.',
    syntax:'SELECT * FROM t1 FULL OUTER JOIN t2 ON t1.id = t2.id;',
    example:'SELECT u.name, o.total FROM ecom_users u FULL OUTER JOIN orders o ON u.id = o.user_id WHERE o.id IS NULL LIMIT 10;',
    proTip:'FULL JOIN is rarely needed. Common use: finding unmatched rows on either side.' },

  { id:'pg-24', group:'Joins', title:'Self JOIN', difficulty:3,
    explanation:'A self join joins a table to itself. Used for hierarchical data like categories with parent_id.',
    syntax:'SELECT a.col, b.col FROM table a JOIN table b ON a.id = b.parent_id;',
    example:'SELECT child.name AS subcategory, parent.name AS parent FROM ecom_categories child JOIN ecom_categories parent ON child.parent_id = parent.id LIMIT 10;',
    proTip:'Always use table aliases in self joins — they are required to distinguish the two instances.' },

  { id:'pg-25', group:'Joins', title:'3-Table JOIN', difficulty:2,
    explanation:'Real queries often join 3 or more tables. Chain JOINs sequentially — each JOIN builds on the previous result.',
    syntax:'SELECT * FROM t1 JOIN t2 ON ... JOIN t3 ON ...;',
    example:'SELECT u.name, p.name AS product, oi.qty FROM orders o JOIN ecom_users u ON o.user_id = u.id JOIN order_items oi ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id LIMIT 10;',
    proTip:'Use meaningful aliases (u for users, o for orders) to keep multi-join queries readable.' },

  // ── GROUP 6: Subqueries ─────────────────────────────────────────
  { id:'pg-26', group:'Subqueries', title:'Subquery in WHERE', difficulty:3,
    explanation:'A subquery is a query nested inside another. The inner query runs first and its result is used by the outer query.',
    syntax:'SELECT * FROM t WHERE col = (SELECT col FROM t2 WHERE cond);',
    example:'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products) LIMIT 10;',
    proTip:'Subqueries that return multiple rows need IN instead of =.' },

  { id:'pg-27', group:'Subqueries', title:'Subquery in FROM', difficulty:3,
    explanation:'A subquery in the FROM clause creates a virtual table (derived table) you can query like a real table.',
    syntax:'SELECT * FROM (SELECT col FROM t WHERE cond) AS alias;',
    example:"SELECT status, cnt FROM (SELECT status, COUNT(*) AS cnt FROM orders GROUP BY status) AS summary WHERE cnt > 500;",
    proTip:'Derived tables must always be given an alias. CTEs (WITH) are often more readable.' },

  { id:'pg-28', group:'Subqueries', title:'EXISTS', difficulty:3,
    explanation:'EXISTS returns TRUE if the subquery returns at least one row. It is often faster than IN for large datasets.',
    syntax:'SELECT * FROM t WHERE EXISTS (SELECT 1 FROM t2 WHERE t2.fk = t.id);',
    example:'SELECT name FROM ecom_users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status = \'delivered\') LIMIT 10;',
    proTip:'Use SELECT 1 or SELECT * inside EXISTS — the actual values do not matter, only whether rows exist.' },

  { id:'pg-29', group:'Subqueries', title:'Correlated Subquery', difficulty:4,
    explanation:'A correlated subquery references columns from the outer query. It runs once per row of the outer query.',
    syntax:'SELECT *, (SELECT COUNT(*) FROM t2 WHERE t2.fk = t.id) AS cnt FROM t;',
    example:'SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_orders FROM ecom_users u LIMIT 10;',
    proTip:'Correlated subqueries can be slow. Often a LEFT JOIN + GROUP BY is faster.' },

  // ── GROUP 7: INSERT ─────────────────────────────────────────────
  { id:'pg-30', group:'INSERT', title:'INSERT Single Row', difficulty:1,
    explanation:'INSERT INTO adds a new row to a table. List the columns and then the values in the same order.',
    syntax:'INSERT INTO table (col1, col2) VALUES (val1, val2);',
    example:"INSERT INTO ecom_categories (name, parent_id) VALUES ('Headphones', 1) RETURNING *;",
    proTip:'Use RETURNING to get the auto-generated ID and other column values immediately after insert.' },

  { id:'pg-31', group:'INSERT', title:'INSERT Multiple Rows', difficulty:1,
    explanation:'You can insert multiple rows in a single INSERT statement by adding more VALUES groups, separated by commas.',
    syntax:'INSERT INTO table (col1, col2) VALUES (v1,v2), (v3,v4);',
    example:"INSERT INTO ecom_categories (name) VALUES ('Cables'), ('Adapters'), ('Cases') RETURNING *;",
    proTip:'Bulk inserts are much faster than individual INSERTs in a loop. Use COPY for very large datasets.' },

  { id:'pg-32', group:'INSERT', title:'INSERT … SELECT', difficulty:2,
    explanation:'INSERT … SELECT copies data from one query result into a table. Useful for archiving or transforming data.',
    syntax:'INSERT INTO t2 (col1) SELECT col1 FROM t1 WHERE cond;',
    example:'INSERT INTO ecom_categories (name) SELECT DISTINCT country FROM ecom_users WHERE country NOT IN (SELECT name FROM ecom_categories) LIMIT 3 RETURNING *;',
    proTip:'This pattern is powerful for data migration and creating summary tables.' },

  { id:'pg-33', group:'INSERT', title:'ON CONFLICT (Upsert)', difficulty:3,
    explanation:'ON CONFLICT handles duplicate key violations — either do nothing or update the existing row (upsert pattern).',
    syntax:'INSERT INTO t (col) VALUES (val) ON CONFLICT (col) DO UPDATE SET ...;',
    example:"INSERT INTO ecom_categories (id, name) VALUES (1, 'Electronics') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name RETURNING *;",
    proTip:'EXCLUDED refers to the row that was rejected — use it in the SET clause to reference the attempted values.' },

  // ── GROUP 8: UPDATE ─────────────────────────────────────────────
  { id:'pg-34', group:'UPDATE', title:'UPDATE Single Row', difficulty:1,
    explanation:'UPDATE modifies existing rows. Always use WHERE to avoid updating every row in the table.',
    syntax:'UPDATE table SET col = val WHERE condition;',
    example:"UPDATE ecom_categories SET name = 'Consumer Electronics' WHERE id = 1 RETURNING *;",
    proTip:'Never run UPDATE without a WHERE clause in production — it affects ALL rows.' },

  { id:'pg-35', group:'UPDATE', title:'UPDATE Multiple Columns', difficulty:1,
    explanation:'You can update multiple columns in a single UPDATE statement by separating assignments with commas.',
    syntax:'UPDATE table SET col1 = v1, col2 = v2 WHERE condition;',
    example:"UPDATE ecom_categories SET name = 'Electronics', parent_id = NULL WHERE id = 1 RETURNING *;",
    proTip:'PostgreSQL executes all SET expressions using the original row values, not the new ones.' },

  { id:'pg-36', group:'UPDATE', title:'UPDATE with JOIN', difficulty:3,
    explanation:'PostgreSQL supports UPDATE … FROM to join another table and use its data in the update.',
    syntax:'UPDATE t1 SET col = t2.val FROM t2 WHERE t1.fk = t2.id;',
    example:'UPDATE products SET rating = r.avg_rating FROM (SELECT product_id, ROUND(AVG(rating)::numeric,2) AS avg_rating FROM reviews GROUP BY product_id) r WHERE products.id = r.product_id RETURNING products.id, products.name, products.rating;',
    proTip:'This is PostgreSQL-specific syntax. In standard SQL you would use a subquery in SET.' },

  { id:'pg-37', group:'UPDATE', title:'UPDATE RETURNING', difficulty:2,
    explanation:'The RETURNING clause makes UPDATE return the modified rows, so you can see the new values without a separate SELECT.',
    syntax:'UPDATE table SET col = val WHERE cond RETURNING *;',
    example:'UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0 RETURNING id, name, stock;',
    proTip:'RETURNING is PostgreSQL-specific but extremely useful for application logic without extra round trips.' },

  // ── GROUP 9: DELETE ─────────────────────────────────────────────
  { id:'pg-38', group:'DELETE', title:'DELETE with WHERE', difficulty:1,
    explanation:'DELETE removes rows from a table. The WHERE clause specifies which rows to delete.',
    syntax:'DELETE FROM table WHERE condition RETURNING *;',
    example:'DELETE FROM ecom_categories WHERE name = \'Cables\' RETURNING *;',
    proTip:'Always test your WHERE clause with SELECT first before running DELETE.' },

  { id:'pg-39', group:'DELETE', title:'DELETE with Subquery', difficulty:2,
    explanation:'Use a subquery to delete rows based on conditions from another table.',
    syntax:'DELETE FROM t WHERE id IN (SELECT id FROM t2 WHERE cond);',
    example:"DELETE FROM ecom_categories WHERE id IN (SELECT id FROM ecom_categories WHERE parent_id IS NOT NULL AND name IN ('Cables','Adapters')) RETURNING *;",
    proTip:'Use DELETE … USING (PostgreSQL syntax) for join-based deletes instead of IN subqueries.' },

  { id:'pg-40', group:'DELETE', title:'TRUNCATE TABLE', difficulty:2,
    explanation:'TRUNCATE removes all rows from a table much faster than DELETE. It does not scan rows — it resets the storage.',
    syntax:'TRUNCATE TABLE table_name RESTART IDENTITY;',
    example:"-- TRUNCATE is destructive! Example only:\n-- TRUNCATE TABLE ecom_categories RESTART IDENTITY CASCADE;\nSELECT COUNT(*) FROM ecom_categories;",
    proTip:'TRUNCATE acquires an ACCESS EXCLUSIVE lock. It cannot be used on tables referenced by foreign keys unless you add CASCADE.' },

  // ── GROUP 10: Functions ─────────────────────────────────────────
  { id:'pg-41', group:'Functions', title:'String Functions', difficulty:2,
    explanation:'PostgreSQL has rich string functions: UPPER, LOWER, LENGTH, TRIM, SUBSTRING, CONCAT, REPLACE, SPLIT_PART.',
    syntax:'SELECT UPPER(col), LENGTH(col), TRIM(col) FROM table;',
    example:"SELECT name, UPPER(name), LENGTH(name), SPLIT_PART(email,'@',2) AS domain FROM ecom_users LIMIT 5;",
    proTip:'Use || for string concatenation: name || \' - \' || country.' },

  { id:'pg-42', group:'Functions', title:'Date & Time Functions', difficulty:2,
    explanation:'NOW() returns the current timestamp. EXTRACT pulls parts like year/month/day. DATE_TRUNC rounds timestamps.',
    syntax:'SELECT EXTRACT(YEAR FROM date_col), DATE_TRUNC(\'month\', date_col) FROM table;',
    example:"SELECT name, created_at, EXTRACT(YEAR FROM created_at) AS year, DATE_TRUNC('month', created_at) AS month FROM ecom_users LIMIT 5;",
    proTip:"Use NOW() - INTERVAL '30 days' to query rows from the last 30 days." },

  { id:'pg-43', group:'Functions', title:'Math Functions', difficulty:1,
    explanation:'ROUND, CEIL, FLOOR, ABS, POWER, SQRT — PostgreSQL supports all standard math operations.',
    syntax:'SELECT ROUND(col::numeric, 2), ABS(col), CEIL(col) FROM table;',
    example:'SELECT name, price, ROUND(price::numeric,0) AS rounded, CEIL(price) AS ceil_price FROM products LIMIT 5;',
    proTip:'Cast to numeric before ROUND: ROUND(price::numeric, 2) — avoids type errors with integers.' },

  { id:'pg-44', group:'Functions', title:'COALESCE & NULLIF', difficulty:2,
    explanation:'COALESCE returns the first non-NULL value from a list. NULLIF returns NULL if two values are equal.',
    syntax:'SELECT COALESCE(col, \'default\') FROM table;',
    example:'SELECT name, COALESCE(rating::text, \'No rating\') AS rating FROM products LIMIT 10;',
    proTip:'COALESCE is essential for safely handling NULL values in reports and calculations.' },

  { id:'pg-45', group:'Functions', title:'CAST & Type Conversion', difficulty:2,
    explanation:'CAST converts a value from one data type to another. PostgreSQL also supports the :: shorthand cast operator.',
    syntax:'SELECT CAST(col AS target_type) FROM table;\n-- or: col::target_type',
    example:"SELECT id::text AS id_str, price::integer AS price_int, created_at::date AS date_only FROM products LIMIT 5;",
    proTip:'The :: syntax is PostgreSQL-specific and shorter. CAST() is standard SQL and more portable.' },

  // ── GROUP 11: Advanced ──────────────────────────────────────────
  { id:'pg-46', group:'Advanced', title:'CTEs (WITH clause)', difficulty:3,
    explanation:'A Common Table Expression (CTE) names a subquery for readability. Multiple CTEs can chain together.',
    syntax:'WITH cte_name AS (SELECT ...) SELECT * FROM cte_name;',
    example:'WITH top_products AS (\n  SELECT product_id, SUM(qty) AS sold FROM order_items GROUP BY product_id ORDER BY sold DESC LIMIT 5\n)\nSELECT p.name, t.sold FROM products p JOIN top_products t ON p.id = t.product_id;',
    proTip:'PostgreSQL CTEs are "optimization fences" — they execute independently. Use subqueries in FROM for better performance.' },

  { id:'pg-47', group:'Advanced', title:'Window Functions', difficulty:4,
    explanation:'Window functions compute values across rows related to the current row without collapsing them. ROW_NUMBER, RANK, LAG, LEAD, SUM OVER.',
    syntax:'SELECT col, ROW_NUMBER() OVER (PARTITION BY col ORDER BY col) FROM table;',
    example:'SELECT name, price, RANK() OVER (ORDER BY price DESC) AS price_rank, AVG(price) OVER () AS overall_avg FROM products LIMIT 10;',
    proTip:'PARTITION BY divides rows into groups, ORDER BY determines the frame. The OVER() clause is what makes it a window function.' },

  { id:'pg-48', group:'Advanced', title:'EXPLAIN & Query Plans', difficulty:4,
    explanation:'EXPLAIN shows the execution plan PostgreSQL uses for a query. EXPLAIN ANALYZE actually runs the query and shows real timings.',
    syntax:'EXPLAIN SELECT * FROM table WHERE condition;\nEXPLAIN ANALYZE SELECT ...;',
    example:'EXPLAIN SELECT * FROM products WHERE price > 100;',
    proTip:'Look for "Seq Scan" on large tables — that means no index is being used. Add an index to fix it.' },

  { id:'pg-49', group:'Advanced', title:'Indexes', difficulty:3,
    explanation:'Indexes speed up queries on large tables. B-tree is the default. Creating one on a heavily queried column dramatically improves performance.',
    syntax:'CREATE INDEX idx_name ON table (column);\nDROP INDEX idx_name;',
    example:'-- View existing indexes:\nSELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname = \'public\' ORDER BY tablename;',
    proTip:'Too many indexes slow down INSERT/UPDATE/DELETE. Only index columns you regularly filter or sort on.' },

  { id:'pg-50', group:'Advanced', title:'Transactions', difficulty:3,
    explanation:'Transactions group multiple SQL statements into an atomic unit — all succeed or all fail. BEGIN…COMMIT wraps them. ROLLBACK undoes them.',
    syntax:'BEGIN;\n  INSERT ...; UPDATE ...;\nCOMMIT; -- or ROLLBACK;',
    example:"BEGIN;\nUPDATE products SET stock = stock - 1 WHERE id = 1;\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (1, 1, 1, 999.99);\nROLLBACK; -- undo for demo\nSELECT stock FROM products WHERE id = 1;",
    proTip:'PostgreSQL runs every statement in an implicit transaction. BEGIN lets you group multiple statements explicitly.' },
];

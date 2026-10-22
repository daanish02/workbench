# Snippets Waiting for Verification

Non-Python code cannot be run by `scripts/check_notes.py`. Writing agents append every non-Python snippet here; the user runs them in online compilers and pastes the real output under each one. Once an output is filled in, copy it into the note (replacing `// output: PENDING`) and delete the entry.

Entry format:

````
### <area>/<section>/<slug> · <language> · <short label>

```<language>
<the exact code from the note>
```

Output:
```
PENDING
```
````

## Pending








































### cs/appendix-languages/assembly-sheet · asm · A First Program

```asm
section .data
msg:    db "Hello, assembly", 10      ; the bytes of the string, then a newline (10)
len:    equ $ - msg                   ; length: current address minus start

section .text
global _start
_start:
    mov eax, 1                        ; system call 1 = write
    mov edi, 1                        ; argument 1: file descriptor 1 = stdout
    lea rsi, [rel msg]                ; argument 2: address of the bytes
    mov edx, len                      ; argument 3: how many bytes
    syscall                           ; enter the kernel
    mov eax, 60                       ; system call 60 = exit
    xor edi, edi                      ; status 0 (xor of a register with itself is 0)
    syscall
; output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/assembly-sheet · asm · Arithmetic

```asm
section .text
global _start
_start:
    mov rax, 7
    imul rax, rax, 6          ; rax = rax * 6 = 42
    sub rax, 2                ; rax = 40
    lea rbx, [rax + rax*4]    ; rbx = 5 * rax = 200, using the address unit as a calculator
    shr rbx, 2                ; shift right by 2 = divide by 4: rbx = 50
    add rax, rbx              ; rax = 90
    mov rdi, rax              ; exit status = result
    mov eax, 60
    syscall
; output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/assembly-sheet · asm · Memory and Addressing

```asm
section .data
nums:   dq 5, 3, 8, 1, 9, 2           ; six 8-byte integers
count:  equ ($ - nums) / 8

section .text
global _start
_start:
    lea rsi, [rel nums]               ; rsi = address of nums[0]
    xor eax, eax                      ; sum = 0
    xor ecx, ecx                      ; i = 0
.loop:
    add rax, [rsi + rcx*8]            ; sum += nums[i]
    inc rcx                           ; i++
    cmp rcx, count
    jl .loop                          ; repeat while i < count
    mov rdi, rax                      ; exit status = sum
    mov eax, 60
    syscall
; output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/assembly-sheet · asm · Control Flow

```asm
section .data
nums:   dq 5, 3, 8, 1, 9, 2
count:  equ ($ - nums) / 8

section .text
global _start
_start:
    lea rsi, [rel nums]
    mov rax, [rsi]                    ; max = nums[0]
    mov ecx, 1                        ; i = 1
.next:
    cmp rcx, count                    ; while (i < count)
    jge .done
    mov rdx, [rsi + rcx*8]
    cmp rdx, rax                      ; if (nums[i] > max)
    jle .skip
    mov rax, rdx                      ;     max = nums[i]
.skip:
    inc rcx
    jmp .next
.done:
    mov rdi, rax                      ; exit status = max
    mov eax, 60
    syscall
; output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/assembly-sheet · asm · Functions and the Stack

```asm
section .text
global _start

factorial:                        ; input rdi = n, output rax = n!
    cmp rdi, 1
    jg .recurse
    mov eax, 1                    ; base case: 0! = 1! = 1
    ret
.recurse:
    push rdi                      ; save n: the recursive call may change rdi
    dec rdi
    call factorial                ; rax = (n - 1)!
    pop rdi                       ; restore n
    imul rax, rdi                 ; rax = n * (n - 1)!
    ret

_start:
    mov edi, 5                    ; first argument goes in rdi
    call factorial
    mov rdi, rax                  ; exit status = 5!
    mov eax, 60
    syscall
; output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/assembly-sheet · c · Calling Assembly from C

```c
// main.c: build with  nasm -f elf64 sum.asm && gcc main.c sum.o -o app && ./app
#include <stdio.h>

long sum_array(const long *a, long n);

int main(void) {
    long a[] = {1, 2, 3, 4, 10};
    printf("%ld %ld\n", sum_array(a, 5), sum_array(a, 0));
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/assembly-sheet · asm · ARM64

```asm
// fact.s: as fact.s -o fact.o && ld fact.o -o fact && ./fact; echo $?   (on ARM64 Linux)
    .global _start
    .text
factorial:                // x0 = n, returns x0 = n!
    mov x1, #1            // result = 1
1:  cmp x0, #1
    b.le 2f               // if n <= 1, jump forward to label 2
    mul x1, x1, x0        // result *= n
    sub x0, x0, #1        // n -= 1
    b 1b                  // jump back to label 1
2:  mov x0, x1
    ret                   // return to the address in x30
_start:
    mov x0, #5
    bl factorial          // call: return address goes to x30
    mov x8, #93           // system call 93 = exit on ARM64 Linux
    svc #0                // exit status is x0 = 120
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · Insert, Update, Delete

```sql
INSERT INTO users (email, name, country)
VALUES ('di@example.com', 'Di', 'NO')
RETURNING id, created_at IS NOT NULL AS has_timestamp;

UPDATE orders SET status = 'shipped'
WHERE status = 'paid' AND placed_on < '2026-02-01'
RETURNING id, status;

INSERT INTO users (email, name, country)
VALUES ('ana@example.com', 'Ana Silva', 'PT')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name   -- upsert: update the existing row
RETURNING id, name;

DELETE FROM users WHERE email = 'di@example.com' RETURNING name;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · Querying and Joining

```sql
SELECT name, country FROM users WHERE country = 'PT' ORDER BY name;

SELECT u.name, o.amount, o.status
FROM orders AS o
JOIN users AS u ON u.id = o.user_id               -- inner join: only matching rows
WHERE o.amount >= 20
ORDER BY o.amount DESC
LIMIT 3;

SELECT u.name, count(o.id) AS orders, coalesce(sum(o.amount), 0) AS total
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id          -- left join: keep users without orders
GROUP BY u.name
HAVING count(o.id) < 3                             -- filter groups, after aggregation
ORDER BY total DESC;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · CTEs and Window Functions

```sql
WITH monthly AS (
    SELECT date_trunc('month', placed_on)::date AS month, sum(amount) AS revenue
    FROM orders
    GROUP BY 1
)
SELECT month, revenue,
       sum(revenue) OVER (ORDER BY month) AS running_total,
       revenue - lag(revenue) OVER (ORDER BY month) AS change
FROM monthly
ORDER BY month;

SELECT user_id, placed_on, amount,
       row_number() OVER (PARTITION BY user_id ORDER BY placed_on) AS nth_order,
       rank() OVER (ORDER BY amount DESC) AS amount_rank
FROM orders
ORDER BY user_id, placed_on;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · JSONB and Arrays

```sql
CREATE TABLE events (
    id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payload jsonb NOT NULL,
    tags    text[] NOT NULL DEFAULT '{}'
);
INSERT INTO events (payload, tags) VALUES
    ('{"type": "click", "user": {"id": 1}, "ms": 120}', '{web,mobile}'),
    ('{"type": "view",  "user": {"id": 2}, "ms": 30}',  '{web}');

SELECT payload->>'type' AS type,                  -- ->> returns text
       (payload->'user'->>'id')::int AS user_id,  -- -> returns jsonb, for nesting
       payload @> '{"type": "click"}' AS is_click, -- containment test
       'mobile' = ANY (tags) AS on_mobile,
       array_length(tags, 1) AS n_tags
FROM events
ORDER BY id;

CREATE INDEX events_payload_gin ON events USING gin (payload);   -- speeds up @> queries
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · Indexes and EXPLAIN

```sql
CREATE INDEX orders_user_id_idx ON orders (user_id);                    -- for the foreign key and joins
CREATE INDEX orders_status_placed_idx ON orders (status, placed_on);    -- composite: leftmost column first
CREATE INDEX orders_unpaid_idx ON orders (placed_on) WHERE status = 'new';   -- partial: only some rows
CREATE INDEX users_email_lower_idx ON users (lower(email));             -- expression index

SET enable_seqscan = off;            -- tiny tables are always scanned; force index use for the demo
EXPLAIN (COSTS OFF)
SELECT * FROM orders WHERE status = 'paid' AND placed_on >= '2026-02-01';
RESET enable_seqscan;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · Transactions and MVCC

```sql
BEGIN;
UPDATE orders SET amount = amount - 5 WHERE id = 3;
SAVEPOINT before_risky;
UPDATE orders SET amount = -1 WHERE id = 4;           -- violates CHECK (amount > 0)
ROLLBACK TO SAVEPOINT before_risky;                   -- undo only the failed part
COMMIT;
SELECT id, amount FROM orders WHERE id IN (3, 4) ORDER BY id;

BEGIN;
SELECT amount FROM orders WHERE id = 5 FOR UPDATE;    -- lock the row until COMMIT
UPDATE orders SET status = 'shipped' WHERE id = 5;
COMMIT;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/postgres-sheet · sql · Views and Functions

```sql
CREATE VIEW user_totals AS
SELECT u.id, u.name, coalesce(sum(o.amount), 0) AS total
FROM users AS u LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.name;

CREATE MATERIALIZED VIEW revenue_by_country AS
SELECT u.country, sum(o.amount) AS revenue
FROM orders AS o JOIN users AS u ON u.id = o.user_id
GROUP BY u.country;

CREATE FUNCTION order_count(uid bigint) RETURNS bigint
LANGUAGE sql STABLE
AS $$ SELECT count(*) FROM orders WHERE user_id = uid $$;

SELECT name, total, order_count(id) FROM user_totals ORDER BY total DESC;
REFRESH MATERIALIZED VIEW revenue_by_country;          -- recompute the stored result
SELECT * FROM revenue_by_country ORDER BY revenue DESC;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/mysql-sheet · sql · Insert, Update, Upsert

```sql
INSERT INTO users (email, name, country) VALUES ('di@example.com', 'Di', 'NO');
SELECT LAST_INSERT_ID() AS new_id;                  -- id generated on this connection

UPDATE orders SET status = 'shipped'
WHERE status = 'paid' AND placed_on < '2026-02-01';
SELECT ROW_COUNT() AS changed;

INSERT INTO users (email, name, country) VALUES ('ana@example.com', 'Ana Silva', 'PT')
AS new
ON DUPLICATE KEY UPDATE name = new.name;            -- upsert on the UNIQUE email
SELECT id, name FROM users WHERE email = 'ana@example.com';

DELETE FROM users WHERE email = 'di@example.com';
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/mysql-sheet · sql · Querying and Joining

```sql
SELECT u.name, COUNT(o.id) AS orders, COALESCE(SUM(o.amount), 0) AS total
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total DESC;

WITH monthly AS (
    SELECT DATE_FORMAT(placed_on, '%Y-%m') AS month, SUM(amount) AS revenue
    FROM orders
    GROUP BY month
)
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month) AS running_total
FROM monthly
ORDER BY month;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/mysql-sheet · sql · JSON

```sql
CREATE TABLE events (
    id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payload  JSON NOT NULL,
    type     VARCHAR(20) AS (payload->>'$.type') STORED,   -- generated column from the JSON
    INDEX idx_type (type)
);
INSERT INTO events (payload) VALUES
    ('{"type": "click", "user": {"id": 1}, "ms": 120}'),
    ('{"type": "view",  "user": {"id": 2}, "ms": 30}');

SELECT type,
       payload->'$.user.id' AS user_id,                  -- -> returns JSON
       JSON_EXTRACT(payload, '$.ms') AS ms,
       JSON_CONTAINS(payload, '"click"', '$.type') AS is_click
FROM events
ORDER BY id;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/mysql-sheet · sql · InnoDB Indexes and EXPLAIN

```sql
CREATE INDEX idx_status_placed ON orders (status, placed_on);   -- composite, leftmost first

EXPLAIN
SELECT id, placed_on FROM orders
WHERE status = 'paid' AND placed_on >= '2026-02-01';
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/mysql-sheet · sql · Transactions and Locking

```sql
SELECT @@transaction_isolation;

START TRANSACTION;
SELECT amount FROM orders WHERE id = 3 FOR UPDATE;      -- lock the row
UPDATE orders SET amount = amount - 5 WHERE id = 3;
SAVEPOINT s1;
UPDATE orders SET amount = 1 WHERE id = 4;
ROLLBACK TO SAVEPOINT s1;
COMMIT;
SELECT id, amount FROM orders WHERE id IN (3, 4) ORDER BY id;
-- output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-tools/terraform-sheet · hcl · HCL Basics

```hcl
variable "env" {
  type    = string
  default = "staging"
}

variable "services" {
  type = map(object({
    port     = number
    replicas = number
  }))
  default = {
    api    = { port = 8080, replicas = 3 }
    worker = { port = 9090, replicas = 1 }
  }
}

locals {
  prefix       = "shop-${var.env}"
  is_prod      = var.env == "prod"
  total_pods   = sum([for s in values(var.services) : s.replicas])
  names        = [for name, s in var.services : "${local.prefix}-${name}"]
  public_ports = { for name, s in var.services : name => s.port if s.port < 9000 }
}

resource "terraform_data" "service" {
  for_each = var.services
  input = {
    name     = "${local.prefix}-${each.key}"
    replicas = local.is_prod ? each.value.replicas * 2 : each.value.replicas
  }
}

output "names" { value = local.names }
output "total_pods" { value = local.total_pods }
output "public_ports" { value = local.public_ports }
output "replicas" { value = { for k, r in terraform_data.service : k => r.output.replicas } }
output "upper" { value = upper(local.prefix) }
# output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/cpp-sheet · cpp · Strings and Lambdas

```cpp
#include <format>
#include <functional>
#include <iostream>
#include <string>
#include <string_view>

bool starts_with_http(std::string_view s) { return s.starts_with("http"); }  // no copy

int main() {
    std::string s = "Hello, World";
    std::cout << s.substr(0, 5) << " " << s.find("World") << " " << s.size() << "\n";
    std::cout << std::format("{:>6}|{:.2f}|{:#x}", "tea", 3.14159, 255) << "\n";
    std::cout << starts_with_http("https://example.com") << " " << std::stoi("42") + 1 << "\n";

    int base = 10;
    auto add_base = [base](int x) { return x + base; };     // captured by value: a copy
    auto bump = [&base]() { ++base; };                      // captured by reference
    bump();
    std::cout << add_base(1) << " " << base << "\n";

    std::function<int(int)> twice = [](int x) { return 2 * x; };
    auto counter = [n = 0]() mutable { return ++n; };      // lambda with its own state
    std::cout << twice(21) << " " << counter() << counter() << "\n";
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/cpp-sheet · cpp · Standard Containers and Algorithms

```cpp
#include <algorithm>
#include <iostream>
#include <map>
#include <ranges>
#include <string>
#include <unordered_map>
#include <vector>

int main() {
    std::vector<int> v{5, 3, 8, 1, 9, 2};
    std::ranges::sort(v);
    auto it = std::ranges::lower_bound(v, 4);          // binary search on sorted data
    std::cout << "first >= 4: " << *it << "\n";

    auto evens_squared = v | std::views::filter([](int x) { return x % 2 == 0; })
                           | std::views::transform([](int x) { return x * x; });
    for (int x : evens_squared) std::cout << x << " ";
    std::cout << "\n";

    std::map<std::string, int> ordered{{"bo", 25}, {"ana", 31}};      // sorted by key (a tree)
    std::unordered_map<std::string, int> hashed{{"x", 1}};            // hash table
    ordered["cy"] = 40;
    for (const auto& [name, age] : ordered) std::cout << name << "=" << age << " ";
    std::cout << "\n" << hashed.contains("x") << " " << hashed.count("y") << "\n";

    v.erase(std::remove_if(v.begin(), v.end(), [](int x) { return x > 5; }), v.end());
    std::cout << v.size() << "\n";
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/cpp-sheet · cpp · Errors

```cpp
#include <expected>
#include <iostream>
#include <stdexcept>
#include <string>

std::expected<int, std::string> parse_age(const std::string& s) {
    try {
        std::size_t used = 0;
        int v = std::stoi(s, &used);
        if (used != s.size()) return std::unexpected("trailing characters in '" + s + "'");
        return v;
    } catch (const std::invalid_argument&) {
        return std::unexpected("not a number: '" + s + "'");
    }
}

int withdraw(int balance, int amount) {
    if (amount > balance) throw std::runtime_error("insufficient funds");
    return balance - amount;
}

int main() {
    for (const char* in : {"42", "forty", "12px"}) {
        auto r = parse_age(in);
        if (r) std::cout << *r << "\n";
        else std::cout << r.error() << "\n";
    }
    try {
        withdraw(5, 9);
    } catch (const std::exception& e) {
        std::cout << "error: " << e.what() << "\n";
    }
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/cpp-sheet · cpp · Classes and Polymorphism

```cpp
#include <iostream>
#include <memory>
#include <numbers>
#include <vector>

class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;            // pure virtual: Shape is abstract
    virtual const char* name() const { return "shape"; }
};

class Circle : public Shape {
    double r_;
public:
    explicit Circle(double r) : r_(r) {}
    double area() const override { return std::numbers::pi * r_ * r_; }
    const char* name() const override { return "circle"; }
};

class Square : public Shape {
    double side_;
public:
    explicit Square(double s) : side_(s) {}
    double area() const override { return side_ * side_; }
};

struct Point {                                   // aggregate: public data, no constructor needed
    double x = 0, y = 0;
    bool operator==(const Point&) const = default;
    Point operator+(const Point& o) const { return {x + o.x, y + o.y}; }
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Circle>(1.0));
    shapes.push_back(std::make_unique<Square>(3.0));
    for (const auto& s : shapes) std::cout << s->name() << " " << s->area() << "\n";

    Point p{1, 2}, q{3, 4};
    Point r = p + q;
    std::cout << r.x << "," << r.y << " " << (r == Point{4, 6}) << "\n";
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/cpp-sheet · cpp · Templates and Concepts

```cpp
#include <concepts>
#include <iostream>
#include <string>
#include <vector>

template <typename T>
T largest(const std::vector<T>& v) {
    T best = v.front();
    for (const T& x : v) if (x > best) best = x;
    return best;
}

template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>;

template <Numeric T>
T average(const std::vector<T>& v) {
    T sum{};
    for (T x : v) sum += x;
    return sum / static_cast<T>(v.size());
}

template <typename T, std::size_t N>
struct FixedStack {
    T items[N];
    std::size_t size = 0;
    void push(T x) { items[size++] = x; }
    T pop() { return items[--size]; }
};

int main() {
    std::cout << largest(std::vector{3, 9, 2}) << " "
              << largest(std::vector<std::string>{"pear", "apple"}) << "\n";
    std::cout << average(std::vector{1.0, 2.0, 4.0}) << " " << average(std::vector{1, 2, 4}) << "\n";
    // average(std::vector<std::string>{"a"});   // error: std::string does not satisfy Numeric
    FixedStack<char, 4> st;
    st.push('a');
    st.push('b');
    std::cout << st.pop() << st.size << "\n";
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/cpp-sheet · cpp · Concurrency

```cpp
#include <atomic>
#include <future>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int main() {
    std::atomic<long> hits{0};
    long guarded = 0;
    std::mutex m;
    {
        std::vector<std::jthread> workers;
        for (int t = 0; t < 4; ++t) {
            workers.emplace_back([&] {
                for (int i = 0; i < 100000; ++i) {
                    hits.fetch_add(1, std::memory_order_relaxed);
                    std::lock_guard lock(m);          // unlocks at end of scope (RAII)
                    ++guarded;
                }
            });
        }
    }                                                 // jthreads join here
    std::cout << hits << " " << guarded << "\n";

    auto f = std::async(std::launch::async, [] { return 6 * 7; });
    std::cout << f.get() << "\n";                     // waits for the result
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Types

```ts
const n: number = 7 / 2;
const big: bigint = 2n ** 64n;
const tags: string[] = ["a", "b"];
const pair: [string, number] = ["age", 31];   // tuple
let state: "idle" | "busy" = "idle";           // union of literal types
const maybe: string | undefined = undefined;
console.log(n, big, tags.length, pair[1], state, maybe ?? "none");
console.log(typeof n, typeof big, typeof null, Number.MAX_SAFE_INTEGER);
console.log(0.1 + 0.2 === 0.3, Number("12px"), parseInt("12px"));
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Variables

```ts
const user = { name: "Ada", langs: ["en"] };
user.langs.push("fr");            // allowed: const fixes the binding, not the object
let count = 0;
count += 1;
let [a, b] = [1, 2];
[a, b] = [b, a];                  // destructuring swap
const { name: userName, langs: [first] } = user;
console.log(user, count, a, b, userName, first);
for (let i = 0; i < 2; i++) {
  setTimeout(() => console.log("let i =", i));   // each iteration gets its own i
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Control Flow

```ts
function describe(x: number | string | null): string {
  if (x === null) return "nothing";
  if (typeof x === "string") return `text of length ${x.length}`;   // x is string here
  return x > 0 ? "positive" : "non-positive";                       // x is number here
}
console.log([5, "hi", null, -1].map(describe));

for (const [i, ch] of ["a", "b"].entries()) console.log(i, ch);
for (const key in { x: 1, y: 2 }) console.log(key);

const day = 6;
switch (day) {
  case 0:
  case 6:
    console.log("weekend");
    break;                         // without break, execution falls through
  default:
    console.log("weekday");
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Functions

```ts
function greet(name: string, greeting = "Hello", punct?: string): string {
  return `${greeting}, ${name}${punct ?? "!"}`;
}
const total = (...nums: number[]): number => nums.reduce((s, n) => s + n, 0);
console.log(greet("Ada"), greet("Ada", "Hi", "."), total(1, 2, 3));

function makeCounter() {
  let count = 0;
  return () => ++count;            // the closure keeps count alive
}
const next = makeCounter();
console.log(next(), next(), next());

const square = (v: number) => v * v;
console.log([1, 2, 3].map(square), [3, 1, 2].filter((v) => v > 1));

function* fib() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
const it = fib();
console.log(Array.from({ length: 8 }, () => it.next().value));
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Collections

```ts
const nums = [3, 1, 2];
nums.push(4);
const sorted = [...nums].sort((x, y) => x - y);   // copy, then sort numerically
console.log(nums, sorted, sorted.at(-1), sorted.slice(1, 3), nums.includes(2));

const ages: Record<string, number> = { ana: 31, bo: 25 };
ages["cy"] = 40;
console.log(Object.keys(ages), Object.entries(ages).length, ages["dee"] ?? 0);

const m = new Map<string, number[]>();
for (const w of ["apple", "avocado", "bean"]) {
  const k = w[0];
  m.set(k, [...(m.get(k) ?? []), w.length]);
}
console.log([...m], m.size);
const s = new Set([1, 2, 2, 3]);
console.log(s.has(2), [...s], [...nums.entries()].length);
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Strings

```ts
const s = "Hello, World";
console.log(s.toLowerCase(), s.split(", "), s.replace("World", "TS"), s.slice(0, 5));
console.log(["a", "b", "c"].join(" | "), "  pad ".trim(), "7".padStart(3, "0"));
const price = 3.5;
console.log(`tea costs ${price.toFixed(2)}`, (12345678).toLocaleString("en-US"));
console.log("naïve".length, "😀".length, [..."😀"].length);
console.log(s.includes("World"), s.startsWith("He"), "ab".repeat(3), s.at(-1));
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Errors

```ts
class InsufficientFunds extends Error {
  constructor(public balance: number, public need: number) {
    super(`balance ${balance}, need ${need}`);
    this.name = "InsufficientFunds";
  }
}

function withdraw(balance: number, amount: number): number {
  if (amount > balance) throw new InsufficientFunds(balance, amount);
  return balance - amount;
}

try {
  withdraw(5, 9);
} catch (e: unknown) {
  if (e instanceof InsufficientFunds) console.log(e.name, e.message, e.need);
} finally {
  console.log("done");
}

try {
  JSON.parse("{bad json");
} catch (e) {
  const err = new Error("config unreadable", { cause: e });
  console.log(err.message, "<-", (err.cause as Error).name);
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Objects, Classes, Interfaces

```ts
interface Point { readonly x: number; readonly y: number }
const p: Point = { x: 3, y: 4 };
const norm = (q: Point) => Math.hypot(q.x, q.y);
console.log(norm(p), norm({ x: 6, y: 8 }));     // any object with x and y fits

class Animal {
  constructor(protected name: string) {}
  speak(): string { return "..."; }
  toString() { return `${this.constructor.name}(${this.name})`; }
}
class Dog extends Animal {
  override speak() { return "woof"; }
}
for (const a of [new Animal("generic"), new Dog("rex")]) console.log(`${a}`, a.speak());

class Account {
  #balance = 0;                                  // truly private at run time
  deposit(v: number) { this.#balance += v; return this; }
  get balance() { return this.#balance; }
}
console.log(new Account().deposit(10).deposit(5).balance);

type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number };
const area = (s: Shape) => (s.kind === "circle" ? Math.PI * s.r ** 2 : s.side ** 2);
console.log(area({ kind: "square", side: 3 }));
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Narrowing and Unions

```ts
type Result = { ok: true; value: number } | { ok: false; error: string };

function describe(x: string | number | Date | null): string {
  if (x === null) return "null";
  if (typeof x === "string") return `string of ${x.length}`;   // x: string here
  if (typeof x === "number") return `number ${x.toFixed(1)}`;  // x: number
  return `date ${x.getUTCFullYear()}`;                          // only Date is left
}

function unwrap(r: Result): number {
  return r.ok ? r.value : -1;                     // the ok field picks the union member
}

type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.round(Math.PI * s.r ** 2);
    case "rect": return s.w * s.h;
    default: {
      const unreachable: never = s;               // a new kind without a case fails to compile here
      return unreachable;
    }
  }
}

interface User { id: number; name: string }
function isUser(v: unknown): v is User {          // a type guard: checks at run time, narrows at compile time
  return typeof v === "object" && v !== null && "id" in v && "name" in v
    && typeof v.id === "number" && typeof v.name === "string";
}

console.log(describe("hey"), describe(2.345), describe(new Date(0)), describe(null));
console.log(unwrap({ ok: true, value: 7 }), unwrap({ ok: false, error: "boom" }));
console.log(area({ kind: "circle", r: 1 }), area({ kind: "rect", w: 2, h: 3 }));
const data: unknown = JSON.parse('{"id": 1, "name": "Ada"}');
console.log(isUser(data) ? data.name.toUpperCase() : "not a user", isUser({ id: "1" }));
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Generics and Utility Types

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const s = new Stack<number>();
s.push(1);
s.push(2);
type User = { id: number; name: string };
const patch: Partial<User> = { name: "Bo" };
console.log(first(["a", "b"]), s.pop(), longest("abc", "de"), longest([1], [1, 2]));
console.log(pluck({ id: 7, name: "Ada" }, "name"), patch);
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Async and the Event Loop

```ts
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchItem(name: string, ms: number): Promise<string> {
  await sleep(ms);                       // yields to the event loop while waiting
  return `${name} done`;
}

async function main() {
  console.log(await Promise.all([fetchItem("a", 20), fetchItem("b", 10)]));  // keeps argument order
  console.log(await Promise.race([fetchItem("slow", 30), fetchItem("fast", 5)]));
  const results = await Promise.allSettled([Promise.reject(new Error("x")), fetchItem("c", 1)]);
  console.log(results.map((r) => r.status));
}

console.log("start");
setTimeout(() => console.log("timeout callback"), 0);
Promise.resolve().then(() => console.log("microtask"));
main();
console.log("end of script");
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · References and Copies

```ts
const a = [1, 2];
const b = a;                   // same array
b.push(3);
const c = [...a];              // shallow copy
c.push(4);
console.log(a, b === a, c);

const nested = { inner: { v: 1 } };
const shallow = { ...nested };
const deep = structuredClone(nested);
nested.inner.v = 99;
console.log(shallow.inner.v, deep.inner.v);

console.log([1, 2] === [1, 2], JSON.stringify([1, 2]) === JSON.stringify([1, 2]));
let x = 1000;
function change(n: number) { n += 1; }
change(x);
console.log(x);
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Modules and Packages

```ts
// math.ts
export const TAU = 2 * Math.PI;
export function circumference(r: number): number {
  return TAU * r;
}
export default class Circle { constructor(public r: number) {} }

// main.ts
import Circle, { circumference, TAU as T } from "./math";
console.log(circumference(1) === T, new Circle(2).r);
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/javascript-typescript · ts · Pitfalls

```ts
const loose: any = 0;                 // any switches off the checks that would reject these lines
console.log(loose == "", null == undefined, "1" + 1, ("3" as any) * ("4" as any));
console.log([10, 9, 1].sort(), [10, 9, 1].sort((a, b) => a - b));
console.log(0.1 + 0.2, Math.round(2.5), Math.round(-2.5));
console.log(typeof NaN, NaN === NaN, Number.isNaN(NaN));

class Counter {
  count = 0;
  inc() { this.count++; return this.count; }
}
const counter = new Counter();
const inc = counter.inc;
try {
  inc();                              // this is undefined when called detached
} catch (e) {
  console.log("detached call failed:", (e as Error).constructor.name);
}
console.log(counter.inc(), ["1", "2", "3"].map(Number.parseInt), ["1", "2", "3"].map((s) => Number.parseInt(s)));
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Types

```go
package main

import "fmt"

func main() {
	var i int
	var f float64
	var s string
	var p *int
	fmt.Printf("%d %v %q %v\n", i, f, s, p) // zero values

	n := 7 / 2   // integer division
	x := 7.0 / 2 // float division
	var b byte = 255
	b++ // wraps around
	fmt.Println(n, x, b, 0.1+0.2 == 0.3)
	fmt.Printf("%T %T %T\n", n, x, 'A')
	fmt.Println(float64(n)*1.5, int(3.99)) // conversions are explicit
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Variables

```go
package main

import "fmt"

const Pi = 3.14159

type Weekday int

const (
	Sunday Weekday = iota // 0
	Monday                // 1
	Tuesday               // 2
)

var counter = 0 // package-level variable

func main() {
	var a, b int = 1, 2
	c := "inferred string"
	a, b = b, a // parallel assignment swaps
	counter++
	fmt.Println(a, b, c, Pi, Tuesday, counter)

	if v := a * 10; v > 5 { // v exists only inside the if
		fmt.Println("v =", v)
	}
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Control Flow

```go
package main

import "fmt"

func main() {
	for i := 0; i < 3; i++ {
		fmt.Print(i, " ")
	}
	fmt.Println()

	n := 1
	for n < 100 { // while-style loop
		n *= 3
	}
	fmt.Println(n)

	for i, ch := range "héllo" { // i is a byte offset, ch a rune
		if i > 3 {
			break
		}
		fmt.Println(i, string(ch))
	}

	for i := range 3 { // range over an integer, Go 1.22+
		switch {
		case i == 0:
			fmt.Println("zero")
		case i%2 == 1:
			fmt.Println("odd")
		default:
			fmt.Println("even")
		}
	}
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Functions

```go
package main

import (
	"errors"
	"fmt"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func sum(nums ...int) int { // variadic
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func makeCounter() func() int {
	count := 0
	return func() int { count++; return count }
}

func main() {
	q, err := divide(7, 2)
	fmt.Println(q, err)
	_, err = divide(1, 0)
	fmt.Println(err)
	fmt.Println(sum(1, 2, 3), sum([]int{4, 5}...))

	next := makeCounter()
	fmt.Println(next(), next(), next())

	defer fmt.Println("deferred: runs last")
	fmt.Println("body done")
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Collections

```go
package main

import (
	"fmt"
	"maps"
	"slices"
	"sort"
)

func main() {
	nums := []int{3, 1, 2}
	nums = append(nums, 4)
	slices.Sort(nums)
	fmt.Println(nums, len(nums), nums[1:3], nums[len(nums)-1])

	grid := make([][]int, 2) // 2 rows, each a separate slice
	for i := range grid {
		grid[i] = make([]int, 3)
	}
	grid[0][1] = 5
	fmt.Println(grid)

	ages := map[string]int{"ana": 31, "bo": 25}
	ages["cy"] = 40
	age, ok := ages["dee"] // comma-ok: was the key present?
	delete(ages, "bo")
	keys := slices.Collect(maps.Keys(ages))
	sort.Strings(keys) // map iteration order is random
	fmt.Println(age, ok, len(ages), keys)

	set := map[string]struct{}{"x": {}, "y": {}}
	_, has := set["x"]
	fmt.Println(has, slices.Contains(nums, 9), slices.Index(nums, 3))
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Strings

```go
package main

import (
	"fmt"
	"strconv"
	"strings"
)

func main() {
	s := "Hello, World"
	fmt.Println(strings.ToLower(s), strings.Split(s, ", "), strings.ReplaceAll(s, "World", "Go"), s[:5])
	fmt.Println(strings.Join([]string{"a", "b", "c"}, " | "), strings.TrimSpace("  pad "), strings.Contains(s, "World"))

	n, err := strconv.Atoi("42")
	fmt.Println(n+1, err, strconv.Itoa(7)+"!", fmt.Sprintf("%05.1f|%-4s|%x", 3.14159, "go", 255))

	word := "naïve"
	fmt.Println(len(word), len([]rune(word)), word[2])

	var b strings.Builder
	for i := range 3 {
		fmt.Fprintf(&b, "%d,", i)
	}
	fmt.Println(b.String())
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Errors

```go
package main

import (
	"errors"
	"fmt"
	"strconv"
)

var ErrNotFound = errors.New("not found") // sentinel error

type InsufficientFunds struct{ Balance, Need int }

func (e *InsufficientFunds) Error() string {
	return fmt.Sprintf("balance %d, need %d", e.Balance, e.Need)
}

func withdraw(balance, amount int) (int, error) {
	if amount > balance {
		return balance, &InsufficientFunds{balance, amount}
	}
	return balance - amount, nil
}

func find(id string) error {
	return fmt.Errorf("loading user %s: %w", id, ErrNotFound) // wrap with context
}

func main() {
	if _, err := withdraw(5, 9); err != nil {
		var funds *InsufficientFunds
		if errors.As(err, &funds) {
			fmt.Println("short by", funds.Need-funds.Balance, "-", err)
		}
	}
	err := find("42")
	fmt.Println(err, errors.Is(err, ErrNotFound))

	_, err = strconv.Atoi("forty")
	fmt.Println(err)

	defer func() {
		if r := recover(); r != nil { // recover stops a panic in a deferred call
			fmt.Println("recovered:", r)
		}
	}()
	var m map[string]int
	m["x"] = 1 // writing to a nil map panics
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Structs, Methods, Embedding

```go
package main

import (
	"fmt"
	"math"
)

type Point struct {
	X, Y float64
}

func (p Point) Norm() float64 { // value receiver: works on a copy
	return math.Hypot(p.X, p.Y)
}

func (p *Point) Scale(k float64) { // pointer receiver: modifies the original
	p.X *= k
	p.Y *= k
}

type Animal struct{ Name string }

func (a Animal) Describe() string { return "animal " + a.Name }

type Dog struct {
	Animal // embedded: Dog gets Name and Describe
	Breed  string
}

func main() {
	p := Point{X: 3, Y: 4}
	p.Scale(2)
	fmt.Println(p, p.Norm(), p == Point{6, 8})
	fmt.Printf("%+v\n", p)

	d := Dog{Animal{"rex"}, "collie"}
	fmt.Println(d.Name, d.Describe(), d.Breed)
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Interfaces and Generics

```go
package main

import (
	"cmp"
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
}

type Circle struct{ R float64 }
type Square struct{ Side float64 }

func (c Circle) Area() float64 { return math.Pi * c.R * c.R }
func (s Square) Area() float64 { return s.Side * s.Side }

func Max[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}

type Stack[T any] struct{ items []T }

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() T {
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v
}

func main() {
	for _, sh := range []Shape{Circle{1}, Square{3}} {
		switch v := sh.(type) { // type switch
		case Circle:
			fmt.Printf("circle r=%v area %.2f\n", v.R, v.Area())
		case Square:
			fmt.Printf("square area %.0f\n", v.Area())
		}
	}
	var s Stack[string]
	s.Push("a")
	s.Push("b")
	fmt.Println(Max(3, 7), Max("pear", "apple"), s.Pop())
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Goroutines and Channels

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs { // ends when jobs is closed
		results <- j * j
	}
}

func main() {
	jobs := make(chan int, 10)
	results := make(chan int, 10)
	var wg sync.WaitGroup
	for range 3 {
		wg.Add(1)
		go worker(jobs, results, &wg)
	}
	for i := 1; i <= 5; i++ {
		jobs <- i
	}
	close(jobs)
	wg.Wait()
	close(results)
	sum := 0
	for r := range results {
		sum += r
	}
	fmt.Println("sum of squares:", sum)

	var mu sync.Mutex
	count := 0
	var wg2 sync.WaitGroup
	for range 100 {
		wg2.Add(1)
		go func() {
			defer wg2.Done()
			mu.Lock()
			count++
			mu.Unlock()
		}()
	}
	wg2.Wait()
	fmt.Println("count:", count)

	select {
	case <-time.After(10 * time.Millisecond):
		fmt.Println("timed out")
	}
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Context and Cancellation

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

// slowQuery stands in for a database call that honours cancellation.
func slowQuery(ctx context.Context, d time.Duration) (string, error) {
	select {
	case <-time.After(d):
		return "rows", nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel() // always release the context's timer

	res, err := slowQuery(ctx, 10*time.Millisecond)
	fmt.Println(res, err)

	_, err = slowQuery(ctx, time.Second) // same deadline: about 40 ms are left
	fmt.Println(err, errors.Is(err, context.DeadlineExceeded))

	parent, stop := context.WithCancel(context.Background())
	done := make(chan struct{})
	for range 3 {
		go func() {
			<-parent.Done() // every goroutine watching the context wakes up at once
			done <- struct{}{}
		}()
	}
	stop()
	for range 3 {
		<-done
	}
	fmt.Println("3 workers stopped:", parent.Err())
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Values, Pointers, Slices

```go
package main

import "fmt"

type Counter struct{ N int }

func incValue(c Counter)    { c.N++ }
func incPointer(c *Counter) { c.N++ }

func newCounter() *Counter {
	return &Counter{} // safe: escapes to the heap
}

func main() {
	c := Counter{}
	incValue(c)
	incPointer(&c)
	fmt.Println(c.N)

	a := make([]int, 3, 4) // length 3, capacity 4
	b := append(a, 99)     // fits in capacity: shares a's array
	b[0] = 7
	fmt.Println(a, b, len(b), cap(b))
	d := append(b, 100) // over capacity: copies to a new array
	d[1] = 8
	fmt.Println(b, d)

	p := newCounter()
	p.N = 5
	fmt.Println(*p, p.N)
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Modules and Packages

```go
-- go.mod --
module example.com/shop

go 1.23
-- price/price.go --
package price

func WithTax(cents int) int { return cents + cents*20/100 } // exported
func round(x int) int       { return x }                     // unexported: package-private
-- main.go --
package main

import (
	"fmt"

	"example.com/shop/price"
)

func main() {
	fmt.Println(price.WithTax(1000))
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/go-sheet · go · Pitfalls

```go
package main

import "fmt"

type MyErr struct{}

func (*MyErr) Error() string { return "my error" }

func mayFail(fail bool) error {
	var e *MyErr // nil pointer of a concrete type
	if fail {
		e = &MyErr{}
	}
	return e // wraps the nil pointer in a non-nil interface
}

func main() {
	err := mayFail(false)
	fmt.Println(err == nil)

	var funcs []func()
	for i := range 3 {
		funcs = append(funcs, func() { fmt.Print(i, " ") }) // Go 1.22+: i is per iteration
	}
	for _, f := range funcs {
		f()
	}
	fmt.Println()

	var m map[string]int // nil map: reads work, writes panic
	fmt.Println(m["missing"], len(m))

	s := []int{1, 2, 3}
	for _, v := range s {
		v *= 10 // modifies a copy
		_ = v
	}
	fmt.Println(s)
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Types

```c
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

int main(void) {
    int i = 7 / 2;                 /* integer division truncates */
    double d = 7 / 2.0;
    unsigned char byte = 255;
    byte++;                        /* unsigned arithmetic wraps: well defined */
    int64_t big = INT64_MAX;
    bool ok = true;
    printf("%d %.1f %u %lld %d\n", i, d, byte, (long long)big, ok);
    printf("%zu %zu %zu %zu\n", sizeof(char), sizeof(int), sizeof(double), sizeof(void *));
    printf("%d %d\n", -7 / 2, -7 % 2);    /* truncates toward zero */
    printf("%d\n", 0.1 + 0.2 == 0.3);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Variables

```c
#include <stdio.h>

#define MAX_USERS 100              /* macro: replaced before compilation */
static int counter;                /* file scope, zero-initialised, invisible to other files */

void bump(void) {
    static int calls = 0;          /* keeps its value between calls */
    calls++;
    counter += calls;
}

int main(void) {
    const double pi = 3.14159;
    int a = 1, b = 2, tmp;
    tmp = a; a = b; b = tmp;       /* swap needs a temporary */
    bump();
    bump();
    printf("%d %d %.2f %d %d\n", a, b, pi, MAX_USERS, counter);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Control Flow

```c
#include <stdio.h>

int main(void) {
    for (int n = -1; n <= 1; n++) {
        const char *kind = n > 0 ? "positive" : n == 0 ? "zero" : "negative";
        printf("%d %s\n", n, kind);
    }

    int n = 1;
    while (n < 100) n *= 3;
    printf("%d\n", n);

    int day = 6;
    switch (day) {
    case 0:
    case 6:
        printf("weekend\n");
        break;                     /* without break, execution falls into the next case */
    default:
        printf("weekday\n");
    }

    int x = 0;
    if (x = 5) printf("assignment, not comparison: x is %d\n", x);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Functions

```c
#include <stdio.h>
#include <stdlib.h>

void swap(int *a, int *b) {        /* pointers let the function modify the caller's ints */
    int t = *a;
    *a = *b;
    *b = t;
}

int divide(int a, int b, int *out) {   /* status code plus output parameter */
    if (b == 0) return -1;
    *out = a / b;
    return 0;
}

int cmp_int(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

int main(void) {
    int a = 1, b = 2, q;
    swap(&a, &b);
    printf("%d %d\n", a, b);
    if (divide(7, 2, &q) == 0) printf("q = %d\n", q);
    if (divide(1, 0, &q) != 0) printf("division by zero\n");

    int nums[] = {3, 1, 2};
    qsort(nums, 3, sizeof nums[0], cmp_int);   /* qsort takes a function pointer */
    printf("%d %d %d\n", nums[0], nums[1], nums[2]);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Collections

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len, cap;
} IntVec;

void push(IntVec *v, int x) {
    if (v->len == v->cap) {
        v->cap = v->cap ? v->cap * 2 : 4;          /* grow geometrically */
        int *p = realloc(v->data, v->cap * sizeof *p);
        if (!p) { perror("realloc"); exit(1); }
        v->data = p;
    }
    v->data[v->len++] = x;
}

int main(void) {
    int fixed[5] = {1, 2, 3};                      /* the rest are zero */
    size_t n = sizeof fixed / sizeof fixed[0];
    printf("%zu %d %d\n", n, fixed[2], fixed[4]);

    int grid[2][3] = {{1, 2, 3}, {4, 5, 6}};       /* row-major in memory */
    printf("%d\n", grid[1][2]);

    IntVec v = {0};
    for (int i = 0; i < 10; i++) push(&v, i * i);
    printf("len %zu cap %zu last %d\n", v.len, v.cap, v.data[v.len - 1]);
    free(v.data);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Strings

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char greeting[16] = "Hello";               /* 5 chars + '\0', rest zero */
    printf("%zu %zu\n", strlen(greeting), sizeof greeting);

    strncat(greeting, ", C", sizeof greeting - strlen(greeting) - 1);
    printf("%s\n", greeting);

    char buf[32];
    int written = snprintf(buf, sizeof buf, "%s has %d chars", greeting, (int)strlen(greeting));
    printf("%s (%d)\n", buf, written);

    printf("%d %d\n", strcmp("apple", "banana") < 0, strcmp("a", "a"));
    const char *s = "naïve";                   /* UTF-8 source: 'ï' is two bytes */
    printf("%zu\n", strlen(s));
    char *dot = strchr("file.tar.gz", '.');
    printf("%s\n", dot);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Errors

```c
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int parse_int(const char *s, long *out) {
    char *end;
    errno = 0;
    long v = strtol(s, &end, 10);
    if (errno == ERANGE || end == s || *end != '\0') return -1;
    *out = v;
    return 0;
}

int main(void) {
    long v;
    const char *inputs[] = {"42", "forty", "12px"};
    for (int i = 0; i < 3; i++) {
        if (parse_int(inputs[i], &v) == 0) printf("%s -> %ld\n", inputs[i], v);
        else printf("%s -> invalid\n", inputs[i]);
    }

    FILE *f = fopen("/no/such/file", "r");
    if (f == NULL) {
        printf("fopen failed: %s\n", strerror(errno));
        return EXIT_FAILURE;
    }
    fclose(f);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Pointers and Memory

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *duplicate(const char *s) {
    size_t n = strlen(s) + 1;          /* + 1 for the terminator */
    char *copy = malloc(n);
    if (!copy) return NULL;
    memcpy(copy, s, n);
    return copy;                       /* caller must free */
}

int main(void) {
    int arr[4] = {10, 20, 30, 40};
    int *p = arr;                      /* the array decays to a pointer to its first element */
    printf("%d %d %d\n", *p, *(p + 2), p[3]);
    printf("%td\n", &arr[3] - &arr[0]);

    char *s = duplicate("heap string");
    printf("%s\n", s);
    free(s);
    s = NULL;                          /* avoid using the dangling pointer */

    int *nums = calloc(3, sizeof *nums);   /* zero-initialised */
    printf("%d %d %d\n", nums[0], nums[1], nums[2]);
    free(nums);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Structs and Function Pointers

```c
#include <math.h>
#include <stdio.h>

typedef struct {
    double x, y;
} Point;

double point_norm(const Point *p) { return sqrt(p->x * p->x + p->y * p->y); }
void point_scale(Point *p, double k) { p->x *= k; p->y *= k; }

typedef struct Shape Shape;
struct Shape {
    double (*area)(const Shape *);     /* function pointer: manual polymorphism */
    double size;
};
double square_area(const Shape *s) { return s->size * s->size; }
double circle_area(const Shape *s) { return 3.14159 * s->size * s->size; }

int main(void) {
    Point p = {.x = 3, .y = 4};        /* designated initialiser */
    point_scale(&p, 2);
    printf("%.1f %.1f %.1f\n", p.x, p.y, point_norm(&p));

    Shape shapes[] = {{square_area, 3}, {circle_area, 1}};
    for (int i = 0; i < 2; i++) printf("%.2f\n", shapes[i].area(&shapes[i]));
    printf("%zu\n", sizeof(Point));
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Bits and Fixed-Width Integers

```c
#include <inttypes.h>
#include <stdint.h>
#include <stdio.h>

enum { READ = 1u << 0, WRITE = 1u << 1, EXEC = 1u << 2 };   // one bit per flag

int main(void) {
    uint8_t flags = 0;
    flags |= READ | EXEC;                 // set two bits
    flags &= (uint8_t)~EXEC;              // clear one
    printf("%d %d %d\n", flags, (flags & READ) != 0, (flags & EXEC) != 0);

    uint32_t x = 0xF0u;
    printf("%" PRIu32 " %" PRIu32 " %" PRIu32 "\n", x >> 4, x << 4, x ^ 0xFFu);
    int bits = 0;
    for (uint32_t t = x; t != 0; t &= t - 1) bits++;   // clears the lowest set bit each pass
    int n = 12;
    printf("%d %d\n", bits, (n & (n - 1)) == 0);       // power-of-two test

    uint8_t u = 250;
    u += 10;                              // unsigned arithmetic wraps modulo 256
    printf("%d %" PRId64 " %zu\n", u, INT64_MAX, sizeof(int64_t));

    uint32_t word = 0x12345678u;
    uint8_t *byte = (uint8_t *)&word;     // inspecting an object's bytes through unsigned char is allowed
    printf("%02x\n", byte[0]);
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Macros and _Generic

```c
#include <stdio.h>
#include <string.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))      /* text substitution: evaluates an argument twice */

#define type_name(x) _Generic((x), int: "int", double: "double", char *: "char *", default: "other")

void swap_any(void *a, void *b, size_t size) {  /* generic through void * and a byte count */
    unsigned char tmp[64];
    if (size > sizeof tmp) return;
    memcpy(tmp, a, size);
    memcpy(a, b, size);
    memcpy(b, tmp, size);
}

int main(void) {
    printf("%d %.1f\n", MAX(3, 7), MAX(2.5, 1.0));
    printf("%s %s %s\n", type_name(1), type_name(1.0), type_name((char *)"s"));
    double x = 1.5, y = 2.5;
    swap_any(&x, &y, sizeof x);
    printf("%.1f %.1f\n", x, y);
    int i = 5;
    int m = MAX(i++, 0);                        /* i++ runs twice */
    printf("%d %d\n", m, i);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Headers and Linking

```c
/* geometry.h: the interface */
#ifndef GEOMETRY_H
#define GEOMETRY_H
double circle_area(double r);
#endif

/* geometry.c: the implementation */
#include "geometry.h"
static const double PI = 3.14159;           /* static: private to this file */
double circle_area(double r) { return PI * r * r; }

/* main.c */
#include <stdio.h>
#include "geometry.h"
int main(void) {
    printf("%.2f\n", circle_area(2));
    return 0;
}
/* build: gcc -c geometry.c && gcc -c main.c && gcc geometry.o main.o -o app */
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Threads and Atomics

```c
#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>

static atomic_long atomic_count = 0;
static long locked = 0;
static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *work(void *arg) {
    (void)arg;
    for (int i = 0; i < 100000; i++) {
        atomic_fetch_add(&atomic_count, 1);
        pthread_mutex_lock(&lock);
        locked++;
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}

int main(void) {
    pthread_t t[4];
    for (int i = 0; i < 4; i++) pthread_create(&t[i], NULL, work, NULL);
    for (int i = 0; i < 4; i++) pthread_join(t[i], NULL);
    printf("atomic %ld, mutex %ld\n", atomic_load(&atomic_count), locked);
    return 0;
}
/* build: gcc -pthread main.c */
// output: PENDING
```

Output:
```
PENDING
```

### cs/appendix-languages/c-sheet · c · Pitfalls

```c
#include <stdio.h>
#include <string.h>

void print_size(int arr[]) {               /* really int *arr */
    printf("inside function: %zu\n", sizeof arr);
}

int main(void) {
    int arr[10];
    printf("in main: %zu\n", sizeof arr);
    print_size(arr);

    unsigned int u = 1;
    int neg = -1;
    printf("%d\n", neg < u);               /* -1 is converted to unsigned */

    char a[] = "abc", b[] = "abc";
    printf("%d %d\n", a == b, strcmp(a, b) == 0);

    int x = 4;
    printf("%d\n", x & 1 == 0);            /* parsed as x & (1 == 0) */
    double avg = 7 / 2;                    /* integer division happens before conversion */
    printf("%.1f\n", avg);
    return 0;
}
// output: PENDING
```

Output:
```
PENDING
```

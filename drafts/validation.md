# Validation

Zero-dependency validation engine with mass-assignment protection. Fields not declared in `make()` are silently dropped from `validated()`, preventing mass-assignment of unexpected POST fields.

```php
$result = validate::make([
    'email' => ['required', 'email'],
    'age'   => ['required', 'int', 'min:18'],
])->check($req->post());

if (!$result->ok) {
    return $res->status(422)->json(['errors' => $result->errors()]);
}
$user = user::create($result->validated());
```

## Built-in rules

`required`, `email`, `url`, `int`, `float`, `bool`, `slug`, `min`, `max`, `in`, `regex`, `same`, `nullable`

**Smart min/max:** works on both numeric values and strings (compares `mb_strlen()`).

```php
'min:3'   // numeric: value >= 3 | string: length >= 3
'max:10'  // numeric: value <= 10 | string: length <= 10
```

## Five ways to declare rules

### 1 — Strings (pipe syntax)

Most concise, easy to read for simple forms.

```php
$result = validate::make([
    'username'              => 'required|min:3|max:40|slug',
    'email'                 => 'required|email',
    'password'              => 'required|min:8',
    'password_confirmation' => 'required|same:password',
    'age'                   => 'required|int|min:18',
    'role'                  => 'required|in:user,moderator',
])->check($req->post());
```

### 2 — Arrays

Slightly more verbose, but more flexible — easy to add objects or callables without changing syntax.

```php
$result = validate::make([
    'username'              => ['required', 'min:3', 'max:40', 'slug'],
    'email'                 => ['required', 'email'],
    'password'              => ['required', 'min:8'],
    'password_confirmation' => ['required', 'same:password'],
    'age'                   => ['required', 'int', 'min:18'],
    'role'                  => ['required', 'in:user,moderator'],
])->check($req->post());
```

### 3 — Hybrid (arrays + Rule objects)

For complex cases. `UniqueRule` is an object implementing the `rule` interface, handles `ignore()` logic for update forms.

```php
$result = validate::make([
    'username'              => ['required', 'min:3', 'max:40', 'slug', new UniqueRule('users', 'username')],
    'email'                 => ['required', 'email', new UniqueRule('users', 'email')],
    'password'              => ['required', 'min:8'],
    'password_confirmation' => ['required', 'same:password'],
    'age'                   => ['required', 'int', 'min:18'],
    'role'                  => ['required', 'in:user,moderator'],
])->check($req->post());
```

### 4 — extend() (custom named rules)

Rule name as a string, logic defined outside. Good when a single rule is used across multiple fields — define once, refer by name. Instance-scoped (safe for FrankenPHP worker mode).

```php
$result = validate::make([
    'username'              => ['required', 'min:3', 'max:40', 'slug', 'username_free'],
    'email'                 => ['required', 'email', 'email_free'],
    'password'              => ['required', 'min:8'],
    'password_confirmation' => ['required', 'same:password'],
    'age'                   => ['required', 'int', 'min:18'],
    'role'                  => ['required', 'in:user,moderator'],
])
->extend(
    'username_free',
    fn($v) => !db::table('users')->where('username', $v)->exists(),
    ':field is already taken.',
)
->extend(
    'email_free',
    fn($v) => !db::table('users')->where('email', $v)->exists(),
    ':field is already taken.',
)
->check($req->post());
```

### 5 — Inline callables

Anonymous function directly in the rules array. Most explicit, logic right where it's used. Convenient for one-time checks, but clutters the rule declaration when there are many fields.

```php
$result = validate::make([
    'username'              => [
        'required', 'min:3', 'max:40', 'slug',
        fn($v) => !db::table('users')->where('username', $v)->exists(),
    ],
    'email'                 => [
        'required', 'email',
        fn($v) => !db::table('users')->where('email', $v)->exists(),
    ],
    'password'              => ['required', 'min:8'],
    'password_confirmation' => ['required', 'same:password'],
    'age'                   => ['required', 'int', 'min:18'],
    'role'                  => ['required', 'in:user,moderator'],
])->check($req->post());
```

## Creating a custom Rule object

Implement `skim\validation\rule` for reusable rules with constructor parameters:

```php
class UniqueRule implements \skim\validation\rule {
    public function __construct(
        private string $table,
        private string $column,
        private ?int $ignoreId = null,
    ) {}

    public function validate(mixed $value, string $field, array $data): bool {
        $query = db::table($this->table)->where($this->column, $value);
        if ($this->ignoreId !== null) {
            $query->where('id != :ignore_id', [':ignore_id' => $this->ignoreId]);
        }
        return !$query->exists();
    }

    public function message(string $field): string {
        return "The {$field} is already taken.";
    }
}

// Usage in update form:
$result = validate::make([
    'email' => ['required', 'email', new UniqueRule('users', 'email', ignoreId: $user->id)],
])->check($req->post());
```

## Nullable fields

Use `nullable` to mark optional fields that should skip validation when absent or null:

```php
$result = validate::make([
    'bio' => ['nullable', 'min:10'],  // null passes, but if present must be >= 10 chars
])->check($req->post());
```

## Typed validated values

Values in `validated()` are automatically cast based on declared rules:

```php
$result = validate::make([
    'age'    => ['required', 'int'],     // '25' → 25 (int)
    'price'  => ['required', 'float'],   // '19.99' → 19.99 (float)
    'active' => ['required', 'bool'],    // '1' → true (bool)
    'email'  => ['required', 'email'],   // normalized via filter
])->check($req->post());

$result->validated()['age'];     // int(25)
$result->validated()['active'];  // bool(true)
```

## Comparison

| Approach | Best for | Pros | Cons |
|----------|----------|------|------|
| **1 — Strings** | Simple forms | Most concise, readable | Cannot add objects |
| **2 — Arrays** | Standard forms | Flexible, easy to extend | Slightly more verbose |
| **3 — Hybrid** | Complex forms with DB checks | Reusable rule objects with params | Requires separate class |
| **4 — extend()** | Shared custom rules | Define once, use by name | Instance-scoped, must chain |
| **5 — Inline callable** | One-off checks | Logic right where used | Clutters rules with many fields |

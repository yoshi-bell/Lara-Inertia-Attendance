<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class RestData extends Data
{
    public function __construct(
        public int $id,
        public int $attendance_id,
        public ?string $start_time_hi,
        public ?string $end_time_hi,
    ) {
    }
}

<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class RestCorrectionData extends Data
{
    public function __construct(
        public int $id,
        public int $attendance_correction_id,
        public ?int $rest_id,
        public string $requested_start_time,
        public ?string $requested_end_time,
        public ?string $requested_start_time_hi,
        public ?string $requested_end_time_hi,
        public string $created_at,
        public string $updated_at,
    ) {
    }
}

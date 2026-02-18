<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AttendanceData extends Data
{
    public function __construct(
        public int $id,
        public int $user_id,
        public string $work_date,
        public ?string $start_time_hi,
        public ?string $end_time_hi,
        public ?string $total_rest_time,
        public ?string $work_time,
        public bool $is_editable,
        public string $updated_at,
        /** @var \Spatie\LaravelData\DataCollection<\App\Data\RestData> */
        public DataCollection $rests,
        public UserData $user,
    ) {}
}

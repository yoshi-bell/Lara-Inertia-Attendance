<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class AttendanceCorrectionData extends Data
{
    public function __construct(
        public int $id,
        public int $attendance_id,
        public int $user_id,
        public string $requested_start_time,
        public string $requested_end_time,
        public ?string $requested_start_time_hi,
        public ?string $requested_end_time_hi,
        public string $reason,
        public string $status, // string (Union) として出力
        public ?string $reviewed_at,
        public ?int $reviewer_id,
        public string $created_at,
        public string $updated_at,

        // リレーション
        public ?AttendanceData $attendance,
        /** @var \Spatie\LaravelData\DataCollection<\App\Data\RestCorrectionData> */
        public ?DataCollection $rest_corrections,
        public ?UserData $requester,
    ) {}
}

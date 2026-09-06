"""Grader for SCIRE experiments.

Every experiment in the workspace must produce a score via this grader
(or an equivalent domain-specific grader) before it can be considered valid.

Usage:
    python grader.py <experiment_dir> <expected_metric> [--margin 0.05]

Exit codes:
    0  - PASS (metric improved beyond margin)
    1  - FAIL (metric did not improve)
    2  - ERROR (malformed experiment output)
"""

import argparse
import json
import sys
from pathlib import Path


def load_result(experiment_dir: Path) -> dict:
    result_file = experiment_dir / "result.json"
    if not result_file.exists():
        raise FileNotFoundError(
            f"No result.json found in {experiment_dir}. "
            "Experiments must write a result.json with a 'metric' field."
        )
    with open(result_file) as f:
        return json.load(f)


def main() -> int:
    parser = argparse.ArgumentParser(description="Grade a SCIRE experiment")
    parser.add_argument("experiment_dir", type=Path)
    parser.add_argument("metric", help="Metric name to grade")
    parser.add_argument("--baseline", type=float, required=True)
    parser.add_argument("--margin", type=float, default=0.05)
    parser.add_argument("--higher-is-better", action="store_true")
    args = parser.parse_args()

    try:
        result = load_result(args.experiment_dir)
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2

    # result.json stores the metric NAME under "metric" and its VALUE under "value".
    if result.get("metric") != args.metric:
        print(
            f"ERROR: metric '{args.metric}' != declared metric "
            f"'{result.get('metric')}' in result.json",
            file=sys.stderr,
        )
        return 2

    try:
        value = float(result["value"])
    except (KeyError, TypeError, ValueError):
        print(f"ERROR: no numeric 'value' field in result.json", file=sys.stderr)
        return 2

    if args.higher_is_better:
        improvement = value - args.baseline
    else:
        improvement = args.baseline - value

    relative = improvement / abs(args.baseline) if args.baseline else 0.0
    passed = relative >= args.margin

    verdict = "PASS" if passed else "FAIL"
    print(
        f"{verdict}: {args.metric} = {value} "
        f"(baseline {args.baseline}, rel. change {relative:+.2%}, "
        f"needed >= {args.margin:+.2%})"
    )
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
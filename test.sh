#!/bin/bash

# ==========================
# JMeter Performance Test Automation Script with Aggregate Report
# ==========================

# Variables
JMETER_PATH="/path/to/apache-jmeter-5.6.3/bin/jmeter"
TEST_PLAN="/path/to/performance_test_plan.jmx"
RESULTS_DIR="/path/to/results"
REPORT_DIR="$RESULTS_DIR/html_report_$(date +%Y%m%d_%H%M%S)"
RESULTS_FILE="$RESULTS_DIR/results_$(date +%Y%m%d_%H%M%S).jtl"

# Create directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$REPORT_DIR"

# Run JMeter test in non-GUI mode and save results
echo "Running JMeter Test Plan..."
$JMETER_PATH -n -t "$TEST_PLAN" -l "$RESULTS_FILE"

# Check if the test was successful
if [ $? -eq 0 ]; then
  echo "Test execution completed successfully."
else
  echo "JMeter test failed!"
  exit 1
fi

# Generate HTML Report (includes Aggregate Report)
echo "Generating HTML Report..."
$JMETER_PATH -g "$RESULTS_FILE" -o "$REPORT_DIR"

# Final check
if [ $? -eq 0 ]; then
  echo "HTML Report generated successfully at: $REPORT_DIR"
else
  echo "Failed to generate the HTML report."
  exit 1
fi

# Done!
echo "Performance test automation complete."






File: run_jmeter_with_report.sh



chmod +x run_jmeter_with_report.sh



./run_jmeter_with_report.sh


Inside your .jmx test plan:
 
Set the Thread Group values as variables:
 
Number of Threads (users): ${__P(users,10)}
 
Ramp-Up Period: ${__P(ramp_up,1)}
 
Loop Count: ${__P(loops,1)}
 

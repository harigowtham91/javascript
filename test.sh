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



JMETER_PIDS=$(ps aux | grep '[j]meter' | awk '{print $2}')

if [ -z "$JMETER_PIDS" ]; then
  echo "No running JMeter processes found."
else
  echo "Killing JMeter processes: $JMETER_PIDS"
  # Kill processes gracefully first
  kill $JMETER_PIDS
  sleep 2

  # Force kill any still alive
  JMETER_PIDS=$(ps aux | grep '[j]meter' | awk '{print $2}')
  if [ -n "$JMETER_PIDS" ]; then
    echo "Force killing remaining JMeter processes: $JMETER_PIDS"
    kill -9 $JMETER_PIDS
  else
    echo "All JMeter processes stopped successfully."
  fi
fi
 
======================>>
#!/bin/bash

# JMeter Automation Script
# This script runs JMeter tests and generates reports with standard deviation

# Configuration variables
JMETER_HOME="/path/to/your/jmeter"  # Update this with your JMeter installation path
TEST_PLAN="your_test.jmx"           # Your JMeter test plan file
RESULTS_DIR="results"               # Directory to store results
REPORT_DIR="reports"                # Directory to store reports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")  # Timestamp for unique file names

# Create directories if they don't exist
mkdir -p $RESULTS_DIR
mkdir -p $REPORT_DIR

# Function to check if JMeter is installed
check_jmeter() {
    if [ ! -d "$JMETER_HOME" ]; then
        echo "Error: JMeter not found at $JMETER_HOME"
        exit 1
    fi
}

# Function to run JMeter test
run_test() {
    echo "Starting JMeter test..."
    $JMETER_HOME/bin/jmeter -n \
        -t $TEST_PLAN \
        -l $RESULTS_DIR/results_$TIMESTAMP.jtl \
        -j $RESULTS_DIR/jmeter_$TIMESTAMP.log
}

# Function to generate HTML report
generate_report() {
    echo "Generating HTML report..."
    $JMETER_HOME/bin/jmeter -g $RESULTS_DIR/results_$TIMESTAMP.jtl \
        -o $REPORT_DIR/report_$TIMESTAMP \
        --jmeterproperty jmeter.reportgenerator.statistic_row.filter_metric_name=^((?!stddev).)*$ \
        --jmeterproperty jmeter.reportgenerator.statistic_row.decimal_places=2
}

# Function to analyze results
analyze_results() {
    echo "Analyzing results..."
    echo "Standard Deviation Analysis:"
    grep "stddev" $REPORT_DIR/report_$TIMESTAMP/statistics.json | awk -F'"' '{print $4}'
}

# Main execution
echo "JMeter Automation Script"
echo "======================="

# Check if JMeter is installed
check_jmeter

# Run the test
run_test

# Generate report
generate_report

# Analyze results
analyze_results

echo "Test completed successfully!"
echo "Results stored in: $RESULTS_DIR/results_$TIMESTAMP.jtl"
echo "Report generated in: $REPORT_DIR/report_$TIMESTAMP"

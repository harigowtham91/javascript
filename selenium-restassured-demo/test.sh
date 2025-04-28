username=("1234567890","987654321")
password=("1234567890","987654321")
ParticipantId=("1234567890","987654321")

# Remove token.txt if it exists
rm -f token.txt

mvn clean

# Iterate through participant IDs
echo "Processing participant IDs..."
for id in "${!ParticipantId[@]}"; do
    mvn compile exec:java -Dexec.mainClass="com.example.AGetAccessToken" -Dexec.args="$username[$id] $password[$id]"

done

# Read file.txt and store in array
echo "Reading file.txt and storing in array..."
declare -a fileContent
while IFS= read -r line; do
    fileContent+=("$line")
done < tokens.txt

# Print array contents and save tokens
echo "Array contents:"
for i in "${!fileContent[@]}"; do
    echo "Index $i: ${fileContent[$i]}"
    # Assuming the token is in fileContent[$i], append it to token.txt
    echo "${fileContent[$i]}" >> token.txt
done


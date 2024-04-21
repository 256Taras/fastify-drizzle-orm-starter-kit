# Description

Script load ENV_CONFIG variables from .ENV_CONFIG file and validate it according to .ENV_CONFIG.example
.ENV_CONFIG -- private file, shouldn't be exposed publicly
.ENV_CONFIG.example -- public file

# Note

Script should have \*.cjs (CommonJS) format, because dotenv dependency uses CommonJS (based on 'require').
We cannot mix require and import in single files

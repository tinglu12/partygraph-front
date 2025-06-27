# load .env file
set dotenv-load

app_name:="podskim"

# causes all just variables to be exported
set export

default:
  @just --list

cls:
  # echo "\033[H\033[J"
  # tput reset
  clear && printf '\e[3J'

dev: cls
  pnpm dev

plex-many: cls
  bun cli.ts plex-many

tech-week: cls
  bun cli.ts tech-week

enrich-events: cls
  bun cli.ts enrich-events

add-people: cls
  bun cli.ts add-people

dedupe: cls
  bun cli.ts dedupe

scrape-events: cls
  bun cli.ts scrape-events

scrape-partiful:
  curl "https://r.jina.ai/https://partiful.com/e/z0P1P7Nydm6XrUTa7p6d" \
    -H "Authorization: Bearer $JINA_READER_API_KEY"

test-jina:
  echo "using api key: $JINA_READER_API_KEY"

json-to-md path="public/scraped/plex-many.json":
  bun cli.ts json-to-md {{path}}

# json-to-md-all:
#   bun cli.ts json-to-md public/scraped/plex-many.json
#   bun cli.ts json-to-md public/scraped/partiful-many.json
#   bun cli.ts json-to-md public/scraped/nytechweek-many.json
#   bun cli.ts json-to-md public/scraped/nytechweek-many.json

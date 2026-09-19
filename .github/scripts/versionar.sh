#!/usr/bin/env bash
# Decide qual versão publicar e, quando preciso, grava o número no jogo.
#
# Regra: soma 1 ao patch da maior tag vX.Y.Z (1.1.0 -> 1.1.1).
# Exceção: se a constante VERSAO do jogo já for MAIOR que a última tag (ou seja,
# você subiu o número à mão para um minor/major, como 1.2.0 ou 2.0.0), essa
# versão é publicada como está.
#
# Saídas (no $GITHUB_OUTPUT, quando existir):
#   versao=X.Y.Z    versão a publicar
#   alterou=true    o arquivo do jogo foi modificado e precisa de commit
set -euo pipefail

ARQ="${ARQUIVO_JOGO:-orbita-do-saber.html}"

ultima="$(git tag -l 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -n1 || true)"
ultima="${ultima#v}"
ultima="${ultima:-0.0.0}"

no_jogo="$(sed -nE 's/^const VERSAO = "([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p' "$ARQ" | head -n1)"
if [ -z "$no_jogo" ]; then
  echo "Não encontrei 'const VERSAO = \"X.Y.Z\"' em $ARQ" >&2
  exit 1
fi

maior="$(printf '%s\n%s\n' "$no_jogo" "$ultima" | sort -V | tail -n1)"

if [ "$no_jogo" != "$ultima" ] && [ "$maior" = "$no_jogo" ]; then
  nova="$no_jogo"
  alterou=false
  echo "VERSAO do jogo ($no_jogo) é maior que a última tag ($ultima): publicando como está."
else
  IFS=. read -r M m p <<< "$ultima"
  nova="$M.$m.$((p + 1))"
  sed -i -E "s/^(const VERSAO = \")[0-9]+\.[0-9]+\.[0-9]+(\")/\1${nova}\2/" "$ARQ"
  alterou=true
  echo "Última tag: $ultima -> nova versão: $nova"
fi

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  { echo "versao=$nova"; echo "alterou=$alterou"; } >> "$GITHUB_OUTPUT"
fi
echo "versao=$nova alterou=$alterou"

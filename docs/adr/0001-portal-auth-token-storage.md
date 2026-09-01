# ADR 0001: Portal-Auth-Token tabgebunden speichern

- Status: Akzeptiert
- Datum: 2026-09-01

## Kontext

Das Portal und die Laravel-API werden als getrennte Anwendungen und potenziell
unter verschiedenen Origins betrieben. Die API authentifiziert das Portal mit
Sanctum Personal Access Tokens im `Authorization: Bearer`-Header. Bisher wurde
der Token dauerhaft in `localStorage` gespeichert.

Web Storage ist für JavaScript lesbar. Ein erfolgreiches XSS kann daher sowohl
`localStorage` als auch `sessionStorage` auslesen. `localStorage` vergrößert das
Zeitfenster zusätzlich: Der Token bleibt nach dem Schließen des Tabs und nach
einem Browser-Neustart erhalten und steht auch auf gemeinsam genutzten Geräten
weiter zur Verfügung.

## Entscheidung

Der Bearer-Token wird ausschließlich in `sessionStorage` gespeichert. Dadurch
gilt er nur für den aktuellen Browser-Tab. Beim Lesen, Schreiben und Löschen
entfernt das Portal zusätzlich einen eventuell vorhandenen Token aus dem alten
`localStorage`; dieser wird nicht migriert und der Benutzer muss sich einmalig
neu anmelden.

Das Portal validiert einen vorhandenen Token beim Start weiterhin über
`GET /auth/me`. Bei Logout oder einer zentral erkannten 401-Antwort werden Token
und benutzerspezifischer Query-Cache gelöscht.

Diese Entscheidung reduziert Persistenz und Auswirkungen auf gemeinsam
genutzten Geräten. Sie ist **kein Schutz gegen XSS**. Die restriktive Content
Security Policy des Produktionscontainers, das Verbot fremder Skripte und die
serverseitige Autorisierung bleiben deshalb zwingende, ergänzende Kontrollen.

## Warum noch kein httpOnly-Cookie?

Ein sicherer Cookie-Modus ist eine koordinierte Architekturänderung und kein
reiner Austausch des Browserspeichers. Der aktuelle getrennte Betrieb erfordert
dann mindestens:

- Sanctums Stateful-API-Middleware und korrekt konfigurierte Stateful Domains,
- credentialed CORS mit expliziter Origin-Allowlist,
- einen CSRF-Cookie-/Header-Flow im Portal,
- HTTPS sowie abgestimmte Cookie-Domain-, `Secure`- und `SameSite`-Werte,
- angepasste lokale, CI- und Produktions-Setups samt Integrationstests.

Eine teilweise Umstellung würde Authentifizierung oder CSRF-Schutz schwächen.
Sie wird daher als eigener, durchgängiger Arbeitsschritt zurückgestellt.

## Zielzustand und Auslöser für die Migration

Ein httpOnly-, `Secure`- und passend gesetztes `SameSite`-Cookie ist der
bevorzugte Zielzustand, sobald das Portal öffentlich betrieben wird, besonders
sensible oder administrative Funktionen erhält oder erhöhte Anforderungen an
Token-Diebstahlschutz gelten. Portal und API sollten dann unter kontrollierten,
gleichartigen HTTPS-Origins betrieben und der vollständige Sanctum-SPA-Flow in
Browser- und API-Integrationstests abgesichert werden.

## Folgen

- Ein Neuladen im selben Tab behält die Sitzung bei.
- Ein neuer Tab beginnt ohne Sitzung; die Anmeldung endet mit dem Schließen des
  Tabs.
- Benutzer älterer Portal-Versionen müssen sich einmalig erneut anmelden.
- XSS kann den Token während einer aktiven Sitzung weiterhin auslesen.

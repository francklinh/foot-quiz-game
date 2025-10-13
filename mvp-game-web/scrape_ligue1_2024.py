import requests
import pandas as pd
from bs4 import BeautifulSoup
from datetime import datetime

# Clubs Ligue 1 2023-2024
clubs = [
    "Paris_Saint-Germain_(football,_2023-2024)",
    "Olympique_de_Marseille_(football,_2023-2024)",
    "AS_Monaco_(football,_2023-2024)",
    "LOSC_Lille_(football,_2023-2024)",
    "Stade_Rennais_(football,_2023-2024)",
    "RC_Lens_(football,_2023-2024)",
    "Olympique_Lyonnais_(football,_2023-2024)",
    "OGC_Nice_(football,_2023-2024)",
    "Montpellier_HSC_(football,_2023-2024)",
    "FC_Nantes_(football,_2023-2024)",
    "Stade_de_Reims_(football,_2023-2024)",
    "Stade_Brestois_(football,_2023-2024)",
    "Clermont_Foot_63_(football,_2023-2024)",
    "FC_Lorient_(football,_2023-2024)",
    "Toulouse_FC_(football,_2023-2024)",
    "Angers_SCO_(football,_2023-2024)",
    "AJ_Auxerre_(football,_2023-2024)",
    "AS_Saint-Étienne_(football,_2023-2024)",
]

base_url = "https://fr.wikipedia.org/wiki/"
rows = []

for club in clubs:
    club_name = club.split("_(")[0].replace("_", " ")
    url = base_url + club
    print(f"Scraping {club_name} ...")
    try:
        r = requests.get(url)
        soup = BeautifulSoup(r.text, "html.parser")

        # trouve tous les tableaux avec des joueurs
        tables = soup.find_all("table", {"class": ["wikitable", "sortable"]})
        for table in tables:
            headers = [th.text.strip() for th in table.find_all("th")]
            if not any("Nom" in h or "Joueur" in h for h in headers):
                continue

            for row in table.find_all("tr")[1:]:
                cols = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
                if len(cols) < 2:
                    continue

                # Cherche le nom du joueur et éventuellement sa nationalité
                name = cols[0]
                country = ""
                for img in row.find_all("img", alt=True):
                    alt = img["alt"]
                    if len(alt) == 2 and alt.isupper():  # drapeaux ex: FR
                        country = alt
                        break

                # Tente d'extraire date de naissance
                birth = ""
                for td in row.find_all("td"):
                    if " (" in td.text or " (" in td.text:
                        # souvent "1 janv. 1995 (29 ans)"
                        txt = td.text.strip().split("(")[0].strip()
                        try:
                            birth = datetime.strptime(txt, "%d %B %Y").date().isoformat()
                        except Exception:
                            birth = txt
                rows.append({
                    "club": club_name,
                    "player_name": name,
                    "country": country,
                    "birthdate": birth
                })
    except Exception as e:
        print(f"Erreur {club_name}: {e}")

# DataFrame
df = pd.DataFrame(rows)
df.drop_duplicates(subset=["player_name", "club"], inplace=True)
df.to_csv("ligue1_players_2024.csv", index=False, encoding="utf-8-sig")

teams = pd.DataFrame(sorted({r["club"] for r in rows}), columns=["team_name"])
teams["season_year"] = 2024
teams["league_code"] = "L1"
teams.to_csv("ligue1_teams_2024.csv", index=False, encoding="utf-8-sig")

print("✅ Fichiers créés : ligue1_players_2024.csv, ligue1_teams_2024.csv")
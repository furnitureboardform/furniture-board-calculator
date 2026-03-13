# ╔════════════════════════════════════════════════════════════════════════╗
# ║                   DRAWER CALCULATION SCRIPT                             ║
# ╚════════════════════════════════════════════════════════════════════════╝

# ========== STATIC VARIABLES - EDIT HERE ==========

# Drawer parameters
number_of_drawers = 2                   # Number of drawers to build
recess_width_mm = 964                   # Width of recess for drawers [mm]
cabinet_depth_mm = 600                  # Cabinet depth (front to back) [mm]

# Material parameters
side_material_thickness_mm = 42         # Thickness of drawer side panels [mm]

# Drawer component dimensions (heights of individual walls)
drawer_side_height_mm = 145             # Height of drawer side [mm]
drawer_front_height_mm = 170            # Height of drawer front/face [mm]
internal_wall_height_1_mm = 100         # Height of internal wall 1 [mm]
internal_wall_height_2_mm = 130         # Height of internal wall 2 [mm]

# Assembly margins
guides_margin_mm = 60                   # Margin for slide guides [mm]
internal_wall_margin_mm = 83            # Margin for internal walls [mm]
bottom_depth_margin_mm = 7              # Margin for bottom depth [mm]
bottom_width_margin_mm = 63             # Margin for bottom width [mm]

# ========== CONSTANTS PER DRAWER ==========
GUIDES_PER_DRAWER = 1                   # Slide guide sets
BRACKETS_PER_DRAWER = 1                 # Bracket sets

# ========== DIMENSION CALCULATIONS ==========

# Drawer internal space dimensions
internal_width = recess_width_mm - (2 * side_material_thickness_mm)
internal_depth = cabinet_depth_mm - guides_margin_mm

# Dimensions of individual panels
side_depth = internal_depth                                          # 540 mm
front_width = internal_width                                         # 880 mm
internal_walls_width = internal_width - internal_wall_margin_mm      # 797 mm
bottom_depth = internal_depth - bottom_depth_margin_mm               # 533 mm
bottom_width = internal_width - bottom_width_margin_mm               # 817 mm

# ========== MATERIAL CALCULATIONS ==========

total_guides = number_of_drawers * GUIDES_PER_DRAWER
total_brackets = number_of_drawers * BRACKETS_PER_DRAWER

# ========== BOARD DATA FOR ONE DRAWER ==========

boards = [
    {
        "nr": 1,
        "name": "Boki szuflady (lewy + prawy)",
        "dimensions": f"{drawer_side_height_mm} × {side_depth}",
        "dimensions_tuple": (drawer_side_height_mm, side_depth),
        "qty_per_drawer": 2,
        "edge_banding": f"Jedno obrzeże na długości {side_depth} mm"
    },
    {
        "nr": 2,
        "name": "Front szuflady",
        "dimensions": f"{drawer_front_height_mm} × {front_width}",
        "dimensions_tuple": (drawer_front_height_mm, front_width),
        "qty_per_drawer": 1,
        "edge_banding": "Wszystkie obrzeża"
    },
    {
        "nr": 3,
        "name": "Ściana wewnętrzna 1",
        "dimensions": f"{internal_wall_height_1_mm} × {internal_walls_width}",
        "dimensions_tuple": (internal_wall_height_1_mm, internal_walls_width),
        "qty_per_drawer": 1,
        "edge_banding": f"Jedno obrzeże na długości {internal_walls_width} mm"
    },
    {
        "nr": 4,
        "name": "Ściana wewnętrzna 2",
        "dimensions": f"{internal_wall_height_2_mm} × {internal_walls_width}",
        "dimensions_tuple": (internal_wall_height_2_mm, internal_walls_width),
        "qty_per_drawer": 1,
        "edge_banding": f"Jedno obrzeże na długości {internal_walls_width} mm"
    },
    {
        "nr": 5,
        "name": "Dno szuflady (HDF)",
        "dimensions": f"{bottom_depth} × {bottom_width}",
        "dimensions_tuple": (bottom_depth, bottom_width),
        "qty_per_drawer": 1,
        "edge_banding": "Bez obrzeża (ukryte)"
    }
]

# ========== SUMMARY OF BOARDS ==========

boards_summary = {}
for board in boards:
    dimensions_key = board['dimensions']
    if dimensions_key not in boards_summary:
        boards_summary[dimensions_key] = {
            "name": board['name'],
            "qty_per_drawer": 0
        }
    boards_summary[dimensions_key]['qty_per_drawer'] += board['qty_per_drawer']

# ========== REPORT OUTPUT ==========

print("\n")
print("╔" + "="*78 + "╗")
print("║" + " "*18 + "NARZĘDZIE DO OBLICZANIA SZUFLAD" + " "*29 + "║")
print("╚" + "="*78 + "╝")

print("\n📋 PARAMETRY WEJŚCIOWE:")
print(f"   ├─ Liczba szuflad: {number_of_drawers}")
print(f"   ├─ Szerokość wnęki na szuflady: {recess_width_mm} mm")
print(f"   └─ Głębokość szafki: {cabinet_depth_mm} mm")

print("\n" + "─"*80)
print("🔧 PROWADNICE I SPRZĘGŁA")
print("─"*80)
print(f"   ├─ Prowadnice przesuwne (1 zestaw na szuflądę): {total_guides} szt.")
print(f"   └─ Sprzęgła (1 zestaw na szuflądę): {total_brackets} szt.")

print("\n" + "─"*80)
print("📦 PANELE DREWNA NA JEDNĄ SZUFLĄDĘ")
print("─"*80)
print()

for board in boards:
    print(f"   {board['nr']}. {board['name']}")
    print(f"       Wymiary: {board['dimensions']} mm")
    print(f"       Ilość: {board['qty_per_drawer']} szt.")
    print(f"       Obrzeża: {board['edge_banding']}")
    print()

print("─"*80)
print(f"📊 RAZEM PANELE NA WSZYSTKIE SZUFLADY ({number_of_drawers})")
print("─"*80)
print()

for dimensions, data in boards_summary.items():
    total_qty = data['qty_per_drawer'] * number_of_drawers
    print(f"   • {dimensions} mm")
    print(f"     Ilość: {total_qty} szt.")
    print()

print("─"*80)
print("📋 PODSUMOWANIE LISTY ZAKUPÓW")
print("─"*80)
print()
print(f"   Prowadnice przesuwne: {total_guides} zestawów")
print(f"   Sprzęgła: {total_brackets} zestawów")
print()

for dimensions, data in boards_summary.items():
    total_qty = data['qty_per_drawer'] * number_of_drawers
    print(f"   Panele drewna {dimensions} mm: {total_qty} szt.")

print("\n" + "="*80 + "\n")

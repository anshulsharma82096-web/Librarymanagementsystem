"""
Search-Based Navigation & Spatial Pathfinding Engine:
Performs A* pathfinding across multi-floor library topologies, generating
waypoint vectors and natural language turn-by-turn guidance to any book shelf.
"""

import math
import heapq
from typing import Dict, List, Tuple, Any, Optional
from seed_data import LIBRARY_FLOORS
from database import LibraryDatabase

class NavigationEngine:
    def __init__(self, db: LibraryDatabase):
        self.db = db
        self.floors = LIBRARY_FLOORS
        # Precompute navigation graph for both floors
        self.nav_graphs = {
            1: self._build_nav_grid(1),
            2: self._build_nav_grid(2)
        }

    def _build_nav_grid(self, floor_num: int) -> Dict[str, Any]:
        """
        Builds a connected waypoint network along hallways, aisle entrances,
        and shelf positions.
        """
        waypoints = {}
        connections = {}

        if floor_num == 1:
            # Floor 1 Waypoints
            wps = {
                "wp_entrance": (80, 480, "Main Entrance"),
                "wp_kiosk": (160, 480, "Interactive AI Kiosk"),
                "wp_circ_desk": (260, 480, "Circulation Desk"),
                "wp_corridor_mid": (520, 480, "Central Corridor Junction"),
                "wp_corridor_east": (740, 480, "East Atrium Corridor"),
                "wp_stairs": (880, 480, "Grand Staircase & Elevator"),

                # Aisle South Entrances (connected to Main Corridor at y=420)
                "wp_aisle_A1_entry": (120, 420, "Aisle A1 Entrance"),
                "wp_aisle_A2_entry": (220, 420, "Aisle A2 Entrance"),
                "wp_aisle_B1_entry": (420, 420, "Aisle B1 Entrance"),
                "wp_aisle_B2_entry": (520, 420, "Aisle B2 Entrance"),
                "wp_aisle_B3_entry": (620, 420, "Aisle B3 Entrance"),

                # Aisle Waypoints along the stacks (y=300, y=180, y=120)
                "wp_A1_mid": (120, 280, "Aisle A1 Mid"),
                "wp_A1_north": (120, 160, "Aisle A1 North"),

                "wp_A2_mid": (220, 280, "Aisle A2 Mid"),
                "wp_A2_north": (220, 160, "Aisle A2 North"),

                "wp_B1_mid": (420, 280, "Aisle B1 Mid"),
                "wp_B1_north": (420, 160, "Aisle B1 North"),

                "wp_B2_mid": (520, 280, "Aisle B2 Mid"),
                "wp_B2_north": (520, 160, "Aisle B2 North"),

                "wp_B3_mid": (620, 280, "Aisle B3 Mid"),
                "wp_B3_north": (620, 160, "Aisle B3 North"),

                # Cross corridor along the north (y=100)
                "wp_north_cross_west": (120, 100, "North Crosswalk West"),
                "wp_north_cross_mid": (420, 100, "North Crosswalk Central"),
                "wp_north_cross_east": (620, 100, "North Crosswalk East")
            }

            edges = [
                # Corridor spine
                ("wp_entrance", "wp_kiosk"),
                ("wp_kiosk", "wp_circ_desk"),
                ("wp_circ_desk", "wp_aisle_A2_entry"),
                ("wp_circ_desk", "wp_corridor_mid"),
                ("wp_corridor_mid", "wp_corridor_east"),
                ("wp_corridor_east", "wp_stairs"),

                # Aisle entries to corridor
                ("wp_kiosk", "wp_aisle_A1_entry"),
                ("wp_circ_desk", "wp_aisle_A2_entry"),
                ("wp_corridor_mid", "wp_aisle_B1_entry"),
                ("wp_corridor_mid", "wp_aisle_B2_entry"),
                ("wp_corridor_east", "wp_aisle_B3_entry"),

                # In-Aisle navigation
                ("wp_aisle_A1_entry", "wp_A1_mid"),
                ("wp_A1_mid", "wp_A1_north"),
                ("wp_A1_north", "wp_north_cross_west"),

                ("wp_aisle_A2_entry", "wp_A2_mid"),
                ("wp_A2_mid", "wp_A2_north"),

                ("wp_aisle_B1_entry", "wp_B1_mid"),
                ("wp_B1_mid", "wp_B1_north"),
                ("wp_B1_north", "wp_north_cross_mid"),

                ("wp_aisle_B2_entry", "wp_B2_mid"),
                ("wp_B2_mid", "wp_B2_north"),

                ("wp_aisle_B3_entry", "wp_B3_mid"),
                ("wp_B3_mid", "wp_B3_north"),
                ("wp_B3_north", "wp_north_cross_east"),

                # North cross corridor
                ("wp_north_cross_west", "wp_north_cross_mid"),
                ("wp_north_cross_mid", "wp_north_cross_east")
            ]

        else:
            # Floor 2 Waypoints
            wps = {
                "wp_stairs": (880, 480, "Elevator / Stairs Arrival"),
                "wp_kiosk": (800, 480, "Mezzanine Guide Station"),
                "wp_circ_desk": (700, 480, "Mezzanine Info Desk"),
                "wp_corridor_mid": (440, 480, "Philosophy Corridor Junction"),
                "wp_corridor_west": (140, 480, "Literature Wing Junction"),

                # Aisle South Entrances
                "wp_aisle_C1_entry": (140, 420, "Aisle C1 Entrance"),
                "wp_aisle_C2_entry": (240, 420, "Aisle C2 Entrance"),
                "wp_aisle_D1_entry": (440, 420, "Aisle D1 Entrance"),
                "wp_aisle_D3_entry": (580, 420, "Aisle D3 Entrance"),
                "wp_aisle_E1_entry": (760, 420, "Aisle E1 Entrance"),
                "wp_aisle_E2_entry": (860, 420, "Aisle E2 Entrance"),

                # Aisle waypoints
                "wp_C1_mid": (140, 260, "Aisle C1 Mid"),
                "wp_C1_north": (140, 140, "Aisle C1 North"),

                "wp_C2_mid": (240, 260, "Aisle C2 Mid"),
                "wp_C2_north": (240, 140, "Aisle C2 North"),

                "wp_D1_mid": (440, 260, "Aisle D1 Mid"),
                "wp_D1_north": (440, 140, "Aisle D1 North"),

                "wp_D3_mid": (580, 260, "Aisle D3 Mid"),
                "wp_D3_north": (580, 140, "Aisle D3 North"),

                "wp_E1_mid": (760, 260, "Aisle E1 Mid"),
                "wp_E1_north": (760, 140, "Aisle E1 North"),

                "wp_E2_mid": (860, 260, "Aisle E2 Mid"),
                "wp_E2_north": (860, 140, "Aisle E2 North"),
            }

            edges = [
                # Corridor
                ("wp_stairs", "wp_kiosk"),
                ("wp_kiosk", "wp_circ_desk"),
                ("wp_circ_desk", "wp_aisle_E2_entry"),
                ("wp_circ_desk", "wp_aisle_E1_entry"),
                ("wp_circ_desk", "wp_corridor_mid"),
                ("wp_corridor_mid", "wp_aisle_D3_entry"),
                ("wp_corridor_mid", "wp_aisle_D1_entry"),
                ("wp_corridor_mid", "wp_corridor_west"),
                ("wp_corridor_west", "wp_aisle_C2_entry"),
                ("wp_corridor_west", "wp_aisle_C1_entry"),

                # In-aisle
                ("wp_aisle_C1_entry", "wp_C1_mid"),
                ("wp_C1_mid", "wp_C1_north"),
                ("wp_aisle_C2_entry", "wp_C2_mid"),
                ("wp_C2_mid", "wp_C2_north"),
                ("wp_aisle_D1_entry", "wp_D1_mid"),
                ("wp_D1_mid", "wp_D1_north"),
                ("wp_aisle_D3_entry", "wp_D3_mid"),
                ("wp_D3_mid", "wp_D3_north"),
                ("wp_aisle_E1_entry", "wp_E1_mid"),
                ("wp_E1_mid", "wp_E1_north"),
                ("wp_aisle_E2_entry", "wp_E2_mid"),
                ("wp_E2_mid", "wp_E2_north")
            ]

        # Convert to adjacency list with Euclidean weights
        adj = {k: [] for k in wps}
        for u, v in edges:
            if u in wps and v in wps:
                p1 = (wps[u][0], wps[u][1])
                p2 = (wps[v][0], wps[v][1])
                dist = math.hypot(p1[0] - p2[0], p1[1] - p2[1])
                adj[u].append((v, dist))
                adj[v].append((u, dist))

        return {"waypoints": wps, "adj": adj}

    def _find_nearest_waypoint(self, floor_num: int, x: float, y: float) -> str:
        grid = self.nav_graphs[floor_num]
        best_wp = None
        min_dist = float("inf")
        for wp_id, wp_data in grid["waypoints"].items():
            dist = math.hypot(wp_data[0] - x, wp_data[1] - y)
            if dist < min_dist:
                min_dist = dist
                best_wp = wp_id
        return best_wp

    def _astar(self, floor_num: int, start_wp: str, goal_wp: str) -> List[str]:
        grid = self.nav_graphs[floor_num]
        wps = grid["waypoints"]
        adj = grid["adj"]

        if start_wp == goal_wp:
            return [start_wp]

        # Priority queue: (f_score, current_node)
        pq = [(0, start_wp)]
        came_from = {}
        g_score = {node: float("inf") for node in wps}
        g_score[start_wp] = 0

        goal_pos = (wps[goal_wp][0], wps[goal_wp][1])

        while pq:
            current_f, current = heapq.heappop(pq)
            if current == goal_wp:
                # Reconstruct path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start_wp)
                path.reverse()
                return path

            for neighbor, weight in adj.get(current, []):
                tentative_g = g_score[current] + weight
                if tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h = math.hypot(wps[neighbor][0] - goal_pos[0], wps[neighbor][1] - goal_pos[1])
                    f = tentative_g + h
                    heapq.heappush(pq, (f, neighbor))

        return [start_wp, goal_wp]

    def find_route_to_book(self, book_id: str, origin_floor: int = 1, origin_name: str = "kiosk") -> Dict[str, Any]:
        book = self.db.get_book_by_id(book_id)
        if not book:
            return {"error": f"Book with id '{book_id}' not found"}

        dest_loc = book["location"]
        dest_floor = dest_loc["floor"]
        dest_x = dest_loc["x"]
        dest_y = dest_loc["y"]

        segments = []
        instructions = []

        # Determine start coordinates
        origin_grid = self.nav_graphs[origin_floor]
        if origin_name == "kiosk":
            start_wp = "wp_kiosk"
        elif origin_name == "entrance":
            start_wp = "wp_entrance" if origin_floor == 1 else "wp_stairs"
        else:
            start_wp = self._find_nearest_waypoint(origin_floor, 160, 480)

        # Case 1: Same Floor Route
        if origin_floor == dest_floor:
            dest_wp = self._find_nearest_waypoint(dest_floor, dest_x, dest_y)
            path_wps = self._astar(dest_floor, start_wp, dest_wp)
            
            # Convert to coordinate points
            pts = []
            for wp in path_wps:
                w_info = self.nav_graphs[dest_floor]["waypoints"][wp]
                pts.append({"x": w_info[0], "y": w_info[1], "label": w_info[2]})
            
            # Final point: actual shelf
            pts.append({"x": dest_x, "y": dest_y, "label": f"Shelf {dest_loc['shelf_label']}"})

            segments.append({
                "floor": dest_floor,
                "points": pts
            })

            instructions.append(f"Start at Floor {dest_floor} - {origin_grid['waypoints'][start_wp][2]}.")
            instructions.append(f"Follow the main pathway towards {dest_loc['section']}.")
            instructions.append(f"Turn into Aisle {dest_loc['aisle']} and proceed to Shelf Unit #{dest_loc['shelf_unit']}.")
            instructions.append(f"Locate '{book['title']}' on Tier {dest_loc['tier']} ({self._tier_name(dest_loc['tier'])}) under Call Number: {book['ddc_code']}.")

        # Case 2: Multi-Floor Transition
        else:
            # Segment 1: Origin to Stairs on Origin Floor
            stairs_wp_orig = "wp_stairs"
            path1 = self._astar(origin_floor, start_wp, stairs_wp_orig)
            pts1 = []
            for wp in path1:
                w_info = self.nav_graphs[origin_floor]["waypoints"][wp]
                pts1.append({"x": w_info[0], "y": w_info[1], "label": w_info[2]})

            segments.append({
                "floor": origin_floor,
                "points": pts1,
                "transition": f"Take Grand Staircase / Elevator to Floor {dest_floor}"
            })

            instructions.append(f"Start at Floor {origin_floor} - {origin_grid['waypoints'][start_wp][2]}.")
            instructions.append(f"Walk along the main corridor towards the Grand Staircase / Elevator.")
            instructions.append(f"Ascend to Floor {dest_floor} ({self.floors[dest_floor]['name']}).")

            # Segment 2: Stairs to Target Shelf on Destination Floor
            stairs_wp_dest = "wp_stairs"
            dest_wp = self._find_nearest_waypoint(dest_floor, dest_x, dest_y)
            path2 = self._astar(dest_floor, stairs_wp_dest, dest_wp)
            pts2 = []
            for wp in path2:
                w_info = self.nav_graphs[dest_floor]["waypoints"][wp]
                pts2.append({"x": w_info[0], "y": w_info[1], "label": w_info[2]})
            pts2.append({"x": dest_x, "y": dest_y, "label": f"Shelf {dest_loc['shelf_label']}"})

            segments.append({
                "floor": dest_floor,
                "points": pts2
            })

            instructions.append(f"Exit elevator on Floor {dest_floor} and enter {dest_loc['section']}.")
            instructions.append(f"Turn into Aisle {dest_loc['aisle']}, navigate to Shelf Unit #{dest_loc['shelf_unit']}.")
            instructions.append(f"Spot '{book['title']}' on Tier {dest_loc['tier']} ({self._tier_name(dest_loc['tier'])}). Call Number: {book['ddc_code']}.")

        # Estimate walking distance and time
        total_dist_pixels = 0
        for seg in segments:
            pts = seg["points"]
            for i in range(len(pts) - 1):
                total_dist_pixels += math.hypot(pts[i+1]["x"] - pts[i]["x"], pts[i+1]["y"] - pts[i]["y"])

        # Approx 10 pixels = 1 meter
        distance_meters = round(total_dist_pixels / 10.0, 1)
        est_seconds = int(distance_meters / 1.2) + (30 if origin_floor != dest_floor else 0)

        return {
            "book": {
                "id": book["id"],
                "title": book["title"],
                "author": book["author"],
                "ddc_code": book["ddc_code"],
                "cover_color": book["cover_color"],
                "location": dest_loc
            },
            "origin": {"floor": origin_floor, "location_name": origin_name},
            "destination": dest_loc,
            "segments": segments,
            "instructions": instructions,
            "estimated_distance_m": distance_meters,
            "estimated_time_seconds": est_seconds,
            "tier_visual": {
                "tier": dest_loc["tier"],
                "tier_name": self._tier_name(dest_loc["tier"]),
                "tier_height": self._tier_height(dest_loc["tier"]),
                "shelf_label": dest_loc["shelf_label"]
            }
        }

    def _tier_name(self, tier: int) -> str:
        names = {
            1: "Tier 1 - Bottom Shelf (30cm)",
            2: "Tier 2 - Lower Shelf (80cm)",
            3: "Tier 3 - Eye Level (140cm - High Popularity)",
            4: "Tier 4 - Top Shelf (190cm)"
        }
        return names.get(tier, f"Tier {tier}")

    def _tier_height(self, tier: int) -> str:
        heights = {1: "30 cm", 2: "80 cm", 3: "140 cm", 4: "190 cm"}
        return heights.get(tier, "120 cm")

    def get_floor_details(self, floor_num: int) -> Dict[str, Any]:
        return self.floors.get(floor_num, self.floors[1])

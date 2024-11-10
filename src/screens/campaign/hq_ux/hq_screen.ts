/**
 * SCREEN FLOWCHART for campaign scene. Each screen exists within the campaign scene as an overlay.
 * 
 * HQ[Company HQ Hub] --> Investment[Investment & Factory Screen]
    HQ --> Trade[Trade Route Selection]
    HQ --> Personnel[Personnel Management]
    HQ --> LoadOut[Expedition Loadout]
    
    Investment --> |Return to Hub| HQ
    Trade --> |Return to Hub| HQ
    Personnel --> |Return to Hub| HQ
    LoadOut --> |Return to Hub| HQ
    
    Investment --> |Purchase| Factory[Factory Cards]
    Investment --> |Purchase| Goods[Trade Goods]
    
    Trade --> |Select Route| RouteDetails[Route Details]
    RouteDetails --> |Confirm| Trade
    
    Personnel --> |View| Roster[Character Roster]
    
    LoadOut --> |Configure| PartySelect[Party Selection]
    PartySelect --> |Assign| EquipmentAssign[Equipment Assignment]
    EquipmentAssign --> |Review| FinalReview[Expedition Review]
    
    FinalReview --> |Launch| Launch[Begin Expedition]
    FinalReview --> |Modify| LoadOut


DETAILS
Here's how I envision each screen working:

Company HQ Hub (Main Screen):

* Central hub showing current funds (£)
* Summary of company status (current year, shareholder expectations)
* Clear buttons/paths to each major activity
* Warning indicators for any urgent issues (traumatized personnel, etc.)
* "Launch Expedition" button (greyed out until requirements met)


Investment & Factory Screen:

* Left side: Available Factory cards to purchase
* Right side: Current owned Factory cards
* Each Factory card shows:

    * Purchase cost
    * Effect type (yearly/per-run/persistent)
    * Clear visualization of trigger conditions

* Tabs at top for switching between:

    * Factory Investments
    * Trade Goods Market

Trade Route Selection:

* 3 route cards displayed side by side
* Each route shows:

    * Difficulty rating
    * Known hazards
    * Market conditions (what's in demand)
    * Potential rewards

* Hover/click for detailed comparison
* Clear "Select Route" button


Personnel Management:


Grid view of all characters showing:

    * Status (Available/Shaken/Dead)
    * Class icon
    * Quick stats
    * Current quirks
    * Cards in the class starting deck


Expedition Loadout (Final Configuration):

Three connected panels:
a. Party Selection (left):

    * Drag-drop interface for assigning 3 characters
    * Quick stats visible

b. Equipment Assignment (middle):

    * Drag-drop interface for assigning items to individual characters; clear visual of which items have been assigned to which characters

c. Expedition Summary (right):

    * Total cargo value
    * Expected deck composition
    * Trade Route details
    * Trade goods taken on expedition
    * Launch button (with warnings if setup is risky)

Key UX Features:

* Consistent "Return to Hub" button in top-left
* Consistent screen name on top
 */
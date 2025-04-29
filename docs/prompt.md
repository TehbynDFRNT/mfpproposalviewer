### OBJECTIVE
___________________

> **Flow:**  getProposalSnapshot JSON (camel-cased version of RAW RPC file) → Snapshot.ts → `src/app/proposal/.../<ComponentName>.tsx`
> **Goal:** Exactly **one strongly-typed object (`Snapshot`)** enters at the RSC boundary and is passed—unchanged—through every React component.  
> Every card now receives `{ snapshot }` and slices locally. **No `snake_case`; no casts.**

---

## 1 Define **`snapshot.ts`**

| ✔︎ What to do | Why / details |
|---------------|---------------|
| **Mirror the payload** | `interface Snapshot` must **exactly** match the camel-cased JSON returned by `get_proposal_snapshot` which ouputs camelized JSON loc |
| **Deep typing** | Cover every nested structure related to the current file `src/app/proposal/.../<ComponentName>.tsx`
---

## 2 Align front-end component: `src/app/proposal/.../<ComponentName>.tsx`

| Step | Instruction |
|------|-------------|

| **Prop contract** | Each section card now exports **one** prop, no additional props:<br>`export default function Card({ snapshot }: { snapshot: Snapshot }) { … }` |
| **Slice locally** | Inside the card: `const { poolProject } = snapshot;` (or whatever slice you need). |
| **Call-site rename** | Convert `〈Card data={snapshot.poolProject} …〉` → `〈Card snapshot={snapshot} …〉`. |
| **Clean-up** | Delete ad-hoc assertions, `toCamel()` helpers, and inline casts. |
| **Perf note** | Passing the full snapshot re-renders the card when **any** field changes. If that becomes noisy, wrap heavy cards in `React.memo` or slice higher up. If you can’t React.memo a card, slice higher up or memoise derived values with useMemo.
| **User Requests** | Make sure the front end component `src/app/proposal/.../<ComponentName>.tsx` diffs enable the user request to become achievable.

---

## 3 Eliminate `snake_case` bleed

* Wrap every RPC call with `fetchWithCamel<Snapshot>()` (generic keeps TS aware).  
* Remove any remaining `toCamel()` utilities in components.  
* Confirm **no component** references snake-case keys.


## 🎯 Outcome

* The entire `getProposalSnapshot` payload flows end-to-end as **one** strongly-typed object.  
* Components slice what they need locally, keeping prop surfaces flat and future-proof.  
* Zero `snake_case` references or unsafe casts remain.  
* Future RPC field additions demand **no** prop rewiring—just extend `Snapshot`.  
* Cards re-render only for the data they consume; memoise if any become hotspots.
* Dead helper code (old toCamel utils, unused props) is deleted as part of each PR


____________REST & THINK___________________

## 2) 📦 snapshot.ts CAMELIZED /type of RSC RPC JSON (TO BE EDITED)

**File path:** `src/app/lib/types/snapshot.ts`

```ts
// — paste your current snapshot.ts here —
```

## 2) 🔍 Full RPC JSON  (Structural Reference Only)
What your RSC RPC returns: the raw JSON body from `getProposalSnapshot`

WARNING: We are not using the RAW snake case below, it is for structural reference. Our supabaseclient.ts camelizes this via snapshot.ts. Your job is to make sure snapshot.ts types the fields and the component references them. 

```json
{
    "fencing": {
        "fenceType": "framelessGlass",
        "costSummary": {
            "totalCost": 3155
        },
        "earthingCost": 0,
        "gateSelection": {
            "quantity": 2,
            "gateTotalCost": 0,
            "freeGateDiscount": 0
        },
        "fenceLinearCost": 3155,
        "earthingRequired": true,
        "fgRetainingPanels": {
            "simpleCost": 3155,
            "complexCost": 0,
            "simpleCount": 0,
            "complexCount": 0
        },
        "totalFenceLengthM": 14
    },
    "poolCosts": {
        "id": "f82bfc6f-6da1-4c62-97a9-4b8e7bd51950",
        "beam": 1123,
        "misc": 0,
        "poolId": "899101c2-f809-49b5-b402-5388c0420c37",
        "saltBags": 19,
        "copingLay": 1045,
        "createdAt": "2025-02-20T04:05:16.942168+00:00",
        "peaGravel": 1628,
        "updatedAt": "2025-02-20T04:37:58.618943+00:00",
        "installFee": 2550,
        "copingSupply": 1107,
        "truckedWater": 129
    },
    "timestamp": "2025-04-28T23:31:51Z",
    "fixedCosts": [
        {
            "id": "c825fe88-893f-4604-9b51-58607c88e9b7",
            "name": "Freight",
            "price": 800,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 1
        },
        {
            "id": "b335f1dc-fcda-47df-8834-ba649588adcf",
            "name": "Earthbond",
            "price": 40,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 2
        },
        {
            "id": "d19b9dba-c036-484d-b74e-04730d909aac",
            "name": "Ag Line",
            "price": 35,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 3
        },
        {
            "id": "7e31adfc-9466-4a6a-8d1f-e33f0676d6dc",
            "name": "Pipe Fitting + 3 Way Valve",
            "price": 300,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 4
        },
        {
            "id": "69578277-9345-4786-9e26-2dee48d02a3b",
            "name": "Filter Slab",
            "price": 50,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 5
        },
        {
            "id": "6f8bd374-d64b-45d8-95cc-bd351a53f53a",
            "name": "Miscellaneous",
            "price": 2700,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 6
        },
        {
            "id": "df475e8c-794b-4a4f-8596-86fad86fa68a",
            "name": "Form 15",
            "price": 1295,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 7
        },
        {
            "id": "94485e26-5c0a-4dfc-872a-f815585d82fd",
            "name": "Fire Ant",
            "price": 165,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 8
        },
        {
            "id": "a3f2eb40-9370-4a3c-bcca-86329216bad3",
            "name": "Temporary Safety Barrier",
            "price": 400,
            "createdAt": "2025-02-18T05:56:22.004151+00:00",
            "displayOrder": 0
        },
        {
            "id": "8589c183-19f4-443c-9e14-c69d4988c2ac",
            "name": "Handover",
            "price": 500,
            "createdAt": "2025-02-18T05:51:06.921502+00:00",
            "displayOrder": 9
        }
    ],
    "poolMargins": {
        "id": "c36122bd-2aa1-464b-84c3-b71bde35f206",
        "poolId": "899101c2-f809-49b5-b402-5388c0420c37",
        "createdAt": "2025-02-20T20:52:23.570521+00:00",
        "updatedAt": "2025-02-20T20:52:23.570521+00:00",
        "marginPercentage": 35.3
    },
    "poolProject": {
        "id": "94cfc225-19b4-4582-a0b2-6c16b7d07df4",
        "email": "karl@kgbcap.com.au",
        "phone": "0490096856",
        "owner1": "Waz Druhan",
        "owner2": "Leeanne",
        "craneId": "c447ac9e-c2b7-4ca2-b503-5352b69cb95f",
        "bobcatId": "a4bb1697-c171-489c-bbd5-0f773415b6dc",
        "createdAt": "2025-04-09T03:39:01.264013+00:00",
        "poolColor": "Silver Mist",
        "updatedAt": "2025-04-28T03:03:16.952232+00:00",
        "homeAddress": "Unit 9, 19-21 Packer Road",
        "siteAddress": null,
        "concreteCuts": null,
        "proposalName": "Waz Druhan & Leeanne Pool Proposal",
        "installationArea": "Sunshine Coast",
        "concreteCutsCost": 0,
        "residentHomeowner": true,
        "trafficControlId": null,
        "concretePumpNeeded": false,
        "retainingWall1Type": "Block Wall - Clad",
        "retainingWall2Type": "Block Wall - Clad",
        "retainingWall3Type": null,
        "retainingWall4Type": null,
        "extraConcretingType": null,
        "extraPavingCategory": "a1d6186e-5378-4eb7-a348-31a7034cddfb",
        "poolSpecificationId": "899101c2-f809-49b5-b402-5388c0420c37",
        "concretePumpQuantity": null,
        "retainingWall1Length": 8,
        "retainingWall2Length": 4,
        "retainingWall3Length": 0,
        "retainingWall4Length": 0,
        "siteRequirementsData": [
            {
                "id": "a3320882-299a-4d57-932e-b28de38003b1",
                "price": 2000,
                "margin": 1000,
                "description": "just testing"
            }
        ],
        "extraPavingTotalCost": 24200,
        "retainingWall1Height1": 0.4,
        "retainingWall1Height2": 1,
        "retainingWall2Height1": 0.2,
        "retainingWall2Height2": 0.6,
        "retainingWall3Height1": 0,
        "retainingWall3Height2": 0,
        "retainingWall4Height1": 0,
        "retainingWall4Height2": 0,
        "siteRequirementsNotes": "",
        "concretePumpTotalCost": 0,
        "extraPavingSquareMeters": 55,
        "retainingWall1TotalCost": 3360,
        "retainingWall2TotalCost": 960,
        "retainingWall3TotalCost": 0,
        "retainingWall4TotalCost": 0,
        "extraConcretingTotalCost": null,
        "extraConcretingSquareMeters": null,
        "underFenceConcreteStripsCost": 0,
        "underFenceConcreteStripsData": [],
        "existingConcretePavingCategory": "a1d6186e-5378-4eb7-a348-31a7034cddfb",
        "existingConcretePavingTotalCost": 3420,
        "existingConcretePavingSquareMeters": 10
    },
    "waterFeature": {
        "id": "279cedf8-5137-44a0-b162-01cc1d88b04d",
        "poolId": "899101c2-f809-49b5-b402-5388c0420c37",
        "ledBlade": "900mm",
        "createdAt": "2025-04-15T02:13:04.702869+00:00",
        "topFinish": "coping_style",
        "totalCost": 4500,
        "updatedAt": "2025-04-15T02:13:04.702869+00:00",
        "customerId": "0b7179a5-0a80-47ed-b12b-9989a520d770",
        "frontFinish": "bag_washed",
        "sidesFinish": "coping_style",
        "waterFeatureSize": "small",
        "backCladdingNeeded": true
    },
    "referenceTables": {
        "craneCosts": [
            {
                "id": "c4d3e57d-ec08-4f5c-a9d5-8c4d1b6791fc",
                "name": "Franna Crane-S20T-L1",
                "price": 700,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 1
            },
            {
                "id": "a4f2a21b-93ea-4064-b05c-c8abca4f2e4d",
                "name": "Franna Crane-S20T+Time-L2",
                "price": 1000,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 2
            },
            {
                "id": "33596014-7041-433b-b6b2-77b461c99b2d",
                "name": "Franna Crane-S40T-L3",
                "price": 1300,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 3
            },
            {
                "id": "2befdbcf-c42d-4188-b2c9-932e92ada605",
                "name": "Franna Crane-S40T+CW-L4",
                "price": 1600,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 4
            },
            {
                "id": "c447ac9e-c2b7-4ca2-b503-5352b69cb95f",
                "name": "Small Slew 40T-L1",
                "price": 1650,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 5
            },
            {
                "id": "0381b9ac-6090-40f1-beb5-fe6cae681a0b",
                "name": "Small Slew 40T-L2",
                "price": 1900,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 6
            },
            {
                "id": "3b8a1cc0-df8f-42c6-8a09-e13d014e69e3",
                "name": "Small Slew 40T-L3",
                "price": 2150,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 7
            },
            {
                "id": "000c6f1f-6ad4-47c4-b4d7-084dce331dac",
                "name": "Small Slew 40T-L4",
                "price": 2400,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 8
            },
            {
                "id": "d2c3ea9d-a30e-4764-9f89-ea73fcc347d3",
                "name": "Small Slew 40T-L5",
                "price": 2650,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 9
            },
            {
                "id": "77045fb9-5484-4b26-baaf-7dd877eb48f0",
                "name": "Small Slew 40T-L6",
                "price": 2900,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 10
            },
            {
                "id": "304e81a0-7259-405b-afe1-edfa8742bc23",
                "name": "Small Slew 40T-L7",
                "price": 3150,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 11
            },
            {
                "id": "255a0400-6379-4369-bf2c-1905bf088e8f",
                "name": "Medium Slew 60T-L1",
                "price": 3300,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 12
            },
            {
                "id": "f4a797bb-6c88-4a33-b36a-360e1cd332c0",
                "name": "Medium Slew 60T-L2",
                "price": 3550,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 13
            },
            {
                "id": "49057153-9792-4312-84ed-5d675cb4b0f9",
                "name": "Medium Slew 60T-L3",
                "price": 3800,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 14
            },
            {
                "id": "80158ed6-671f-41db-9070-340c3d37ce16",
                "name": "Large Slew 80T-L1",
                "price": 3900,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 15
            },
            {
                "id": "653d6688-638b-4824-b073-5f2341b4aaf0",
                "name": "Large Slew 80T-L2",
                "price": 4150,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 16
            },
            {
                "id": "2a69aa28-6796-4e9b-9f9f-797dadb898af",
                "name": "Large Slew 80T-L3",
                "price": 4400,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 17
            },
            {
                "id": "45a32d68-7bad-4485-9750-cddcd9592ce3",
                "name": "Large Slew 80T-L4",
                "price": 4650,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 18
            },
            {
                "id": "f3072b07-9633-4d96-9e04-996b90e57a53",
                "name": "Large Slew 80T-L5",
                "price": 4900,
                "createdAt": "2025-02-17T07:11:09.751432+00:00",
                "displayOrder": 19
            }
        ],
        "bobcatCosts": [
            {
                "id": "a4bb1697-c171-489c-bbd5-0f773415b6dc",
                "price": 1000,
                "dayCode": "D1",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 1,
                "sizeCategory": "Size 1"
            },
            {
                "id": "23b3ba5c-0ae4-4545-b154-02801c453d8c",
                "price": 1100,
                "dayCode": "D2",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 2,
                "sizeCategory": "Size 1"
            },
            {
                "id": "23dfe96c-f64f-4fe5-8e89-964f3aaf7167",
                "price": 1200,
                "dayCode": "D3",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 3,
                "sizeCategory": "Size 1"
            },
            {
                "id": "da91c66c-025d-445c-985b-099799215874",
                "price": 1300,
                "dayCode": "D4",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 4,
                "sizeCategory": "Size 1"
            },
            {
                "id": "c1bb3674-223c-4af3-9897-2d46900ae30d",
                "price": 1400,
                "dayCode": "D5",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 5,
                "sizeCategory": "Size 1"
            },
            {
                "id": "e58c4b11-912d-44dc-b5c1-e4275ed07c7f",
                "price": 1500,
                "dayCode": "D6",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 6,
                "sizeCategory": "Size 1"
            },
            {
                "id": "9f23d9e7-e8fc-4d0d-bebf-70342ea4403a",
                "price": 1600,
                "dayCode": "D7",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 7,
                "sizeCategory": "Size 1"
            },
            {
                "id": "a097cf2f-262f-4eec-b5d7-efe462af9527",
                "price": 1700,
                "dayCode": "D8",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 8,
                "sizeCategory": "Size 1"
            },
            {
                "id": "05c84dbf-6312-4d7b-b2f5-88e7f2f0ff8a",
                "price": 1800,
                "dayCode": "D9",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 9,
                "sizeCategory": "Size 1"
            },
            {
                "id": "cb4b68fe-48e0-475d-a816-d8aa792ad6e7",
                "price": 1400,
                "dayCode": "D1",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 1,
                "sizeCategory": "Size 2"
            },
            {
                "id": "64706ba6-4153-44ca-85c6-0aedd638b154",
                "price": 1500,
                "dayCode": "D2",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 2,
                "sizeCategory": "Size 2"
            },
            {
                "id": "20fd4c0d-24f7-471d-a229-667e6daca24a",
                "price": 1600,
                "dayCode": "D3",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 3,
                "sizeCategory": "Size 2"
            },
            {
                "id": "0c7c21de-2422-46b6-bbc9-a918900b82af",
                "price": 1700,
                "dayCode": "D4",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 4,
                "sizeCategory": "Size 2"
            },
            {
                "id": "ba5534e6-753d-4212-88f1-695e4060cce3",
                "price": 1800,
                "dayCode": "D5",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 5,
                "sizeCategory": "Size 2"
            },
            {
                "id": "2727343f-cdec-4dfa-bb31-bf519b215f2e",
                "price": 1900,
                "dayCode": "D6",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 6,
                "sizeCategory": "Size 2"
            },
            {
                "id": "2e947748-1b70-46a8-a77d-1a75dfe7f8f6",
                "price": 2000,
                "dayCode": "D7",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 7,
                "sizeCategory": "Size 2"
            },
            {
                "id": "a1811caf-ee9c-4bb0-ade2-2b05de63be21",
                "price": 2100,
                "dayCode": "D8",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 8,
                "sizeCategory": "Size 2"
            },
            {
                "id": "8418cb7d-c832-43de-8558-fc112490168f",
                "price": 2200,
                "dayCode": "D9",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 9,
                "sizeCategory": "Size 2"
            },
            {
                "id": "d5ee3f92-5d29-45f3-b847-4e46df7c32d1",
                "price": 1600,
                "dayCode": "D1",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 1,
                "sizeCategory": "Size 3"
            },
            {
                "id": "82c22813-0465-48f0-9314-20c53a1436df",
                "price": 1700,
                "dayCode": "D2",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 2,
                "sizeCategory": "Size 3"
            },
            {
                "id": "b51d0d3d-4a37-4ad4-a3a0-f3e1acf0c280",
                "price": 1800,
                "dayCode": "D3",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 3,
                "sizeCategory": "Size 3"
            },
            {
                "id": "f93a1000-f477-46d0-b16f-87d8840c00ed",
                "price": 1900,
                "dayCode": "D4",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 4,
                "sizeCategory": "Size 3"
            },
            {
                "id": "da82508f-b63f-44db-8ec2-1cd10c9b788b",
                "price": 2000,
                "dayCode": "D5",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 5,
                "sizeCategory": "Size 3"
            },
            {
                "id": "c48a2fea-bf55-4e74-8094-6fd3c754bbd0",
                "price": 2100,
                "dayCode": "D6",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 6,
                "sizeCategory": "Size 3"
            },
            {
                "id": "a4ab5a56-b79b-470e-8c7a-45dc2b29b079",
                "price": 2200,
                "dayCode": "D7",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 7,
                "sizeCategory": "Size 3"
            },
            {
                "id": "5bf0b4b4-c0a7-4861-8a42-34dac40cabfd",
                "price": 2300,
                "dayCode": "D8",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 8,
                "sizeCategory": "Size 3"
            },
            {
                "id": "a40fa758-0ff3-46f2-ab81-f5a34e1a042f",
                "price": 2400,
                "dayCode": "D9",
                "createdAt": "2025-02-17T07:04:00.265116+00:00",
                "displayOrder": 9,
                "sizeCategory": "Size 3"
            }
        ],
        "concreteCuts": [
            {
                "id": "94b510b1-bb79-447c-815b-ec589ea537e9",
                "price": 320,
                "cutType": "1/4 Pool",
                "createdAt": "2025-03-12T06:03:12.288156+00:00",
                "updatedAt": "2025-03-12T06:03:12.288156+00:00",
                "displayOrder": 1
            },
            {
                "id": "4d0aae81-a015-4ccb-82f5-dd941edecb53",
                "price": 640,
                "cutType": "1/2 Pool",
                "createdAt": "2025-03-12T06:03:12.288156+00:00",
                "updatedAt": "2025-03-12T06:03:12.288156+00:00",
                "displayOrder": 2
            },
            {
                "id": "21ec071d-dc66-453e-9b52-8bc36470b33f",
                "price": 960,
                "cutType": "3/4 Pool",
                "createdAt": "2025-03-12T06:03:12.288156+00:00",
                "updatedAt": "2025-03-12T06:03:12.288156+00:00",
                "displayOrder": 3
            },
            {
                "id": "3aa72ae3-14e9-4d45-b7d3-60ac5f41c79c",
                "price": 1280,
                "cutType": "Full Pool",
                "createdAt": "2025-03-12T06:03:12.288156+00:00",
                "updatedAt": "2025-03-12T06:03:12.288156+00:00",
                "displayOrder": 4
            },
            {
                "id": "721accb5-2882-44c0-ad08-b1e055dd7283",
                "price": 50,
                "cutType": "Diagonal Cuts",
                "createdAt": "2025-03-12T06:03:12.288156+00:00",
                "updatedAt": "2025-03-12T06:03:12.288156+00:00",
                "displayOrder": 5
            }
        ],
        "retainingWalls": [
            {
                "id": "1a4e61bd-c61c-42d8-afde-3ac6bf01afef",
                "rate": 400,
                "type": "Block Wall - Finished Block Work & Painted",
                "total": 540,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 40,
                "updatedAt": "2025-04-09T06:59:49.920216+00:00"
            },
            {
                "id": "51b91bab-5feb-45b4-9c76-9790f03b09e5",
                "rate": 400,
                "type": "Drop Edge - Clad",
                "total": 700,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 200,
                "updatedAt": "2025-04-09T07:00:02.787424+00:00"
            },
            {
                "id": "bd52c4fa-fd32-4a53-8746-607c231acea7",
                "rate": 400,
                "type": "Drop Edge - Render",
                "total": 600,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 100,
                "updatedAt": "2025-04-09T07:00:06.908616+00:00"
            },
            {
                "id": "96510a0a-e295-4c55-bab7-70a8a4ec124f",
                "rate": 400,
                "type": "Drop Edge - Render & Painted",
                "total": 640,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 140,
                "updatedAt": "2025-04-09T07:00:10.621211+00:00"
            },
            {
                "id": "ca34365d-97dc-48cb-a354-079c839f6ffa",
                "rate": 400,
                "type": "Drop Edge - Strip Finish",
                "total": 500,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 0,
                "updatedAt": "2025-04-09T07:00:14.420458+00:00"
            },
            {
                "id": "99a39d0a-bf5f-4f3c-89f0-ff1490e50ed5",
                "rate": 400,
                "type": "Drop Edge - Strip Finish & Painted",
                "total": 540,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 40,
                "updatedAt": "2025-04-09T07:00:20.001645+00:00"
            },
            {
                "id": "e5b4b506-ed7b-4af8-90fc-9daf17cf3cb0",
                "rate": 400,
                "type": "Timber",
                "total": 500,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 0,
                "updatedAt": "2025-04-09T07:00:24.363905+00:00"
            },
            {
                "id": "88029bc5-24b4-4b63-8dc0-bc58f5124422",
                "rate": 300,
                "type": "Block Wall - Clad",
                "total": 600,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 200,
                "updatedAt": "2025-04-09T07:00:33.495825+00:00"
            },
            {
                "id": "3645876e-43e1-4470-b8ac-a0d8e9d15cb9",
                "rate": 400,
                "type": "Block Wall - Finished Block Work",
                "total": 500,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 0,
                "updatedAt": "2025-04-09T07:00:37.851121+00:00"
            },
            {
                "id": "68440138-926e-49d8-8498-cfe42745265f",
                "rate": 300,
                "type": "Block Wall - Rendered",
                "total": 500,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 100,
                "updatedAt": "2025-04-09T07:00:47.949767+00:00"
            },
            {
                "id": "22a1fd82-947a-41d4-9e8a-ef4cdcb58de1",
                "rate": 300,
                "type": "Block Wall - Rendered & Painted",
                "total": 540,
                "margin": 100,
                "createdAt": "2025-02-26T06:17:16.780085+00:00",
                "extraRate": 140,
                "updatedAt": "2025-04-09T07:00:54.703708+00:00"
            }
        ],
        "extraPavingCosts": [
            {
                "id": "a1d6186e-5378-4eb7-a348-31a7034cddfb",
                "category": "Category 1",
                "createdAt": "2025-03-12T04:53:45.809834+00:00",
                "paverCost": 99,
                "updatedAt": "2025-03-12T04:53:45.809834+00:00",
                "marginCost": 100,
                "wastageCost": 13,
                "displayOrder": 1
            },
            {
                "id": "0f677f22-ef34-43f8-ac56-036279369fbf",
                "category": "Category 2",
                "createdAt": "2025-03-12T04:53:45.809834+00:00",
                "paverCost": 114,
                "updatedAt": "2025-03-12T04:53:45.809834+00:00",
                "marginCost": 100,
                "wastageCost": 13,
                "displayOrder": 2
            },
            {
                "id": "32c991c6-c523-4ec3-ac48-162243cd586b",
                "category": "Category 3",
                "createdAt": "2025-03-12T04:53:45.809834+00:00",
                "paverCost": 137,
                "updatedAt": "2025-03-12T04:53:45.809834+00:00",
                "marginCost": 100,
                "wastageCost": 13,
                "displayOrder": 3
            },
            {
                "id": "0e60a579-1d4c-4941-acac-6650272cd3eb",
                "category": "Category 4",
                "createdAt": "2025-03-12T04:53:45.809834+00:00",
                "paverCost": 137,
                "updatedAt": "2025-03-12T04:53:45.809834+00:00",
                "marginCost": 100,
                "wastageCost": 13,
                "displayOrder": 4
            }
        ],
        "trafficControlCosts": [
            {
                "id": "61b98542-bdb1-4294-9a07-7715cba4a429",
                "name": "Level 1",
                "price": 1600,
                "createdAt": "2025-02-17T07:15:54.592033+00:00",
                "displayOrder": 1
            },
            {
                "id": "8d906b28-954d-4234-bb15-58456104c3cf",
                "name": "Level 2",
                "price": 3100,
                "createdAt": "2025-02-17T07:15:54.592033+00:00",
                "displayOrder": 2
            },
            {
                "id": "3f833867-4cfe-423d-b19b-7b9e5be39500",
                "name": "Level 3",
                "price": 3800,
                "createdAt": "2025-02-17T07:15:54.592033+00:00",
                "displayOrder": 3
            },
            {
                "id": "3a389b6d-82d2-42ea-ae58-b9e9cda3983c",
                "name": "Level 4",
                "price": 5300,
                "createdAt": "2025-02-17T07:15:54.592033+00:00",
                "displayOrder": 4
            }
        ]
    },
    "filtrationPackage": {
        "id": "630c7c7a-8d41-4039-9825-79d414f71263",
        "name": "Option 6",
        "pumpId": "386a9fa7-cc9a-4a76-8018-6a5d8f882b20",
        "lightId": "eae62c3e-8fc3-4cca-bb94-7fa4bd1dc784",
        "filterId": "5de66f00-a1e8-479d-896b-74edd73f42a5",
        "createdAt": "2025-02-18T04:45:19.955795+00:00",
        "filterType": null,
        "sanitiserId": "4e326db6-f135-4dc3-b51b-56b20b514942",
        "displayOrder": 6,
        "handoverKitId": "42975ab4-cb8e-40b0-912d-44f20bfc286d"
    },
    "poolSpecification": {
        "name": "Verona",
        "color": "Latin",
        "dimensions": {
            "widthM": 2.5,
            "lengthM": 4.5,
            "deepDepthM": 1.5,
            "shallowDepthM": 1.1
        }
    },
    "electricalRequirements": null
}
```

## 3) 🔧 Component`src/app/proposal/.../<ComponentName>.tsx` FILE PATH:
**File path:** `src/app/proposal/.../<ComponentName>.tsx`

### a) `src/app/proposal/.../<ComponentName>.tsx` FILE CONTENTS (TO BE EDITED):
```tsx
// — copy the JSX/type code you want to change here —
```


____________REST & THINK___________________

USER REQUESTS: 'UserRequest'

AGENT:
— task begins here—
Diff to apply to Snapshot.ts
```diff
```

Diff to apply to `src/app/proposal/.../<ComponentName>.tsx`
```diff
...
//
```

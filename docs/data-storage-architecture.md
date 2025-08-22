# ScheduleX Data Storage Architecture

## Data Storage Architecture Overview

```mermaid
graph TD
    A[ScheduleX App] --> B[Zustand State Management]
    
    B --> C[Main Store - useStore]
    B --> D[Task Store - useTaskStore]
    
    C --> E[AsyncStorage - registers-storage]
    D --> F[AsyncStorage - task-storage]
    
    E --> G[Persisted Register Data]
    D --> H[Persisted Task Data]
    
    G --> G1[Registers Object]
    G --> G2[Active Register State]
    G --> G3[UI State]
    G --> G4[Settings]
    
    H --> H1[Task Lists Array]
    H --> H2[Active List State]
    H --> H3[Task Metadata]
    
    G1 --> I[Register Schema]
    H1 --> J[Task List Schema]
    
    I --> I1[Register ID]
    I --> I2[Register Name]
    I --> I3[Cards Array]
    I --> I4[Card Size]
    I --> I5[Color Theme]
    
    I3 --> K[Card Schema]
    
    J --> J1[List ID]
    J --> J2[List Name]
    J --> J3[List Color]
    J --> J4[Tasks Array]
    J --> J5[Completed Tasks]
    
    J4 --> L[Task Schema]
    J5 --> L
```

## Card Storage Schema

```mermaid
graph TD
    A[Card Interface] --> B[Core Properties]
    A --> C[Attendance Data]
    A --> D[Schedule Data]
    A --> E[Metadata]
    
    B --> B1[id: number]
    B --> B2[title: string]
    B --> B3[target_percentage: number]
    B --> B4[tagColor: string]
    
    C --> C1[present: number]
    C --> C2[total: number]
    C --> C3[markedAt: Array]
    
    C3 --> C3a[Marking Schema]
    C3a --> C3a1[id: number]
    C3a --> C3a2[date: string]
    C3a --> C3a3[isPresent: boolean]
    C3a --> C3a4[timeSlot?: string]
    
    D --> D1[days: Object]
    D1 --> D1a[mon: string[]]
    D1 --> D1b[tue: string[]]
    D1 --> D1c[wed: string[]]
    D1 --> D1d[thu: string[]]
    D1 --> D1e[fri: string[]]
    D1 --> D1f[sat: string[]]
    D1 --> D1g[sun: string[]]
    
    E --> E1[hasLimit: boolean]
    E --> E2[limit: number]
    E --> E3[limitType: string]
```

## Task Storage Schema

```mermaid
graph TD
    A[Task Interface] --> B[Core Properties]
    A --> C[Content Data]
    A --> D[Metadata]
    A --> E[Overlay Features]
    
    B --> B1[id: number]
    B --> B2[title: string]
    B --> B3[description: string]
    B --> B4[completed: boolean]
    B --> B5[type: TaskType]
    
    B5 --> B5a[task]
    B5 --> B5b[message]
    B5 --> B5c[image]
    B5 --> B5d[url]
    
    C --> C1[priority: Priority]
    C1 --> C1a[high]
    C1 --> C1b[medium]
    C1 --> C1c[low]
    
    C --> C2[dueDate: string]
    C --> C3[category: string]
    C --> C4[imageUri?: string]
    C --> C5[urlData?: Object]
    
    C5 --> C5a[url: string]
    C5 --> C5b[title?: string]
    C5 --> C5c[description?: string]
    C5 --> C5d[image?: string]
    
    D --> D1[timestamp: string]
    D --> D2[completedAt?: string]
    
    E --> E1[starred?: boolean]
    E --> E2[pinned?: boolean]
```

## State Management Flow

```mermaid
graph TD
    A[Component Action] --> B{Store Type}
    
    B -->|Register Action| C[Main Store - useStore]
    B -->|Task Action| D[Task Store - useTaskStore]
    
    C --> C1[State Update Function]
    D --> D1[State Update Function]
    
    C1 --> C2[Immutable State Update]
    D1 --> D2[Immutable State Update]
    
    C2 --> C3[Zustand Middleware]
    D2 --> D3[Zustand Middleware]
    
    C3 --> C4[Persist Middleware]
    D3 --> D4[Persist Middleware]
    
    C4 --> C5[JSON Serialization]
    D4 --> D5[JSON Serialization]
    
    C5 --> C6[AsyncStorage Write]
    D5 --> D6[AsyncStorage Write]
    
    C6 --> C7[registers-storage Key]
    D6 --> D7[task-storage Key]
    
    C7 --> E[Device Storage]
    D7 --> E
    
    E --> F[Data Persistence]
    
    F --> G[App Restart]
    G --> H[Data Restoration]
    
    H --> I[AsyncStorage Read]
    I --> J[JSON Deserialization]
    J --> K[State Hydration]
    K --> L[Component Re-render]
```

## Data Flow Architecture

```mermaid
graph TD
    A[User Interaction] --> B[Component]
    
    B --> C[Store Action Call]
    
    C --> D{Action Type}
    
    D -->|Register Action| E[Register Store Actions]
    D -->|Task Action| F[Task Store Actions]
    
    E --> E1[setRegisters]
    E --> E2[addCard]
    E --> E3[markPresent/Absent]
    E --> E4[editCard]
    E --> E5[removeCard]
    E --> E6[addRegister]
    E --> E7[removeRegister]
    
    F --> F1[addTask]
    F --> F2[toggleTaskCompletion]
    F --> F3[deleteTask]
    F --> F4[updateTask]
    F --> F5[addTaskList]
    F --> F6[starTask]
    F --> F7[pinTask]
    
    E1 --> G[State Mutation]
    E2 --> G
    E3 --> G
    E4 --> G
    E5 --> G
    E6 --> G
    E7 --> G
    
    F1 --> H[State Mutation]
    F2 --> H
    F3 --> H
    F4 --> H
    F5 --> H
    F6 --> H
    F7 --> H
    
    G --> I[Register Data Persistence]
    H --> J[Task Data Persistence]
    
    I --> K[AsyncStorage Update]
    J --> K
    
    K --> L[UI Re-render]
    L --> M[Updated Component State]
```

## Default Data Initialization

```mermaid
graph TD
    A[App First Launch] --> B[Check AsyncStorage]
    
    B --> C{Data Exists?}
    
    C -->|No| D[Initialize Default Data]
    C -->|Yes| E[Load Persisted Data]
    
    D --> D1[Create Default Registers]
    D1 --> D1a[Register 0: Default Empty]
    D1 --> D1b[Register 1: Morning Routine]
    D1 --> D1c[Register 2: Evening Routine]
    
    D1a --> D2[Assign Tag Colors]
    D1b --> D2
    D1c --> D2
    
    D2 --> D3[Initialize Default Tasks]
    D3 --> D3a[List 1: Sample Tasks]
    D3 --> D3b[List 2: Empty]
    D3 --> D3c[List 3: Empty]
    
    D --> D4[Set Default Settings]
    D4 --> D4a[activeRegister: 0]
    D4 --> D4b[defaultTargetPercentage: 75]
    D4 --> D4c[notificationLeadTime: 10]
    D4 --> D4d[selectedSchedules: all]
    
    E --> F[Validate Data Structure]
    F --> G[Migrate if Needed]
    G --> H[Load into Stores]
    
    D --> H
    H --> I[App Ready]
```

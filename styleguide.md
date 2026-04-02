# BJJ Amigo: Style Guide

This style guide documents the Material-UI icons used throughout the BJJ Amigo application to promote consistency and reusability.

## Material-UI Icons

All icons are imported from `@mui/icons-material`.

### Navigation & Layout Controls
Used for navigating the app, opening menus, and changing view formats.
- **`Home`**: Home page navigation (Mobile Navigation bar)
- **`Person`**: User profile navigation (Mobile Navigation bar)
- **`MenuBook`**: Journal navigation, indicating study/learning content (Navigation, Profile "To Learn" section)
- **`LibraryBooks`**: Techniques database navigation (Navigation)
- **`Book`**: Journal navigation (Mobile Navigation bar)
- **`ArrowBack`**: Back navigation (Technique Details)
- **`ViewModule`**: Grid view toggle (Techniques page)
- **`ViewList`**: List view toggle (Techniques page)
- **`ChevronRight`**: Indicates a link or navigation to detail pages (Techniques list items)
- **`ExpandMore` / `ExpandLess`**: Expanding/collapsing accordion and lists (Profile sections, Techniques filters)
- **`Close`**: Closing dialogs and modals (Profile, Technique modifer)

### Actions
Used for user interactions and modifying data.
- **`Add` (`AddIcon`)**: Creating new entities like adding a session or a technique
- **`Edit` (`EditIcon`)**: Editing existing entities like journal entries or user profile
- **`Delete` (`DeleteIcon`)**: Deleting entities like journal entries
- **`FilterList`**: Opening search/filtering options (Techniques page)
- **`Logout`**: User logout action (Profile)
- **`PhotoCamera`**: Uploading/adding images (Technique Form)

### Status & Feedback
Used to represent specific status flags or categorizations for entities.
- **`Favorite`**: Marking an item as a favorite (Technique Details, Profile)
- **`School`**: Indicating a user is "Currently Learning" a technique (Technique Details, Profile)
- **`EventNote`**: Indicates journal entries connected to a technique (Technique Details)

### Theme
Used for global app states.
- **`Brightness4` / `Brightness7`**: Toggling between Dark and Light mode themes (Navbar)

---

### Usage Guidelines

When adding new features, please consult this list first to see if an existing icon fits your use case before importing a new one. This helps maintain a cohesive design language across the application while minimizing bundle size bloat.

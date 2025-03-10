// @flow

/*
 * # How Flow Definitions work:
 *
 * ## The `+` before keys within object types means that key is read-only.
 * - Flow editor plugins should give autocomplete for various keys.
 * - Some editor plugins should also show you documentation during autocomplete
 *
 * ## Declaring Global Variables
 * - Every `declare var` declares a variable that is available globally
 * - Every `type` declaration defines that type to be used globally as well.
 * - The `.eslintrc` will also need to be updated to ignore these globals
 *
 * ## Unique Names
 * Variables and Types *must* have unique names from each other. So when there
 * is a collision, the type names is prefixed with a `T`.
 * e.g. `Editor` and `TEditor`.
 *
 * Read More at https://flow.org/en/docs/libdefs/creation/
 *
 */

/*
 * This refers to the markdown editor and the currently opened note.
 * You can access the text directly from here, change the selection and even
 * highlight parts.
 *
 * However, be careful about character positions, because NotePlan hides
 * Markdown characters and replaces whole parts of text such as the URL in
 * Markdown links or folded text with a single symbol. This can make
 * calculating character positions and changing the text a bit tricky. Prefer
 * working with the paragraph objects instead to modify text directly.
 *
 * Here are the available functions you can call with the Editor object:
 */

declare var Editor: TEditor

/**
 * The Editor class. This lets you access the currently opened note.
 */
declare interface TEditor extends CoreNoteFields {
  /**
   * Get the note object of the opened note in the editor
   */
  +note: ?TNote;
  /**
   * Inserts the given text at the given character position (index)
   * @param text 	  - Text to insert
   * @param index   - Position to insert at (you can get this using 'renderedSelection' for example)
   */
  insertTextAtCharacterIndex(text: string, index: number): void;
  /**
   * Get an array of selected lines. The cursor doesn't have to select the full
   * line, NotePlan returns all complete lines the cursor "touches".
   */
  +selectedLinesText: $ReadOnlyArray<string>;
  /**
   * Get an array of selected paragraphs. The cursor doesn't have to select the
   * full paragraph, NotePlan returns all complete paragraphs the cursor
   * "touches".
   */
  +selectedParagraphs: $ReadOnlyArray<TParagraph>;
  /**
   * Get the raw selection range (hidden Markdown is considered).
   */
  +selection: ?Range;
  /**
   * Get the rendered selection range (hidden Markdown is NOT considered).
   */
  +renderedSelection: ?Range;
  /**
   * Get the selected text.
   */
  +selectedText: ?string;

  /**
   * Inserts the given text at the current cursor position
   * @param text - Text to insert
   */
  insertTextAtCursor(text: string): void;
  /**
   * Inserts a plain paragraph before the selected paragraph (or the paragraph the cursor is currently positioned)
   * @param name - Text of the paragraph
   * @param type - paragraph type
   * @param indents - How much it should be indented
   */
  insertParagraphAtCursor(name: string, type: ParagraphType, indents: number): void;
  /**
   * Replaces the current cursor selection with the given text
   * @param text - Text to insert
   */
  replaceSelectionWithText(text: string): void;
  /**
   * Opens a note using the given filename.
   * Note: some parameters introduced in v3.4 and v3.5.2
   * @param {string} filename - Filename of the note file (can be without extension), but has to include the relative folder such as `folder/filename.txt`.
   * @param {boolean} newWindow - (optional) Open note in new window (default = false)?
   * @param {number} highlightStart - (optional) Start position of text highlighting
   * @param {number} highlightEnd - (optional) End position of text highlighting
   * @param {boolean} splitView - (optional) Open note in a new split view (Note: Available from v3.4)
   * @param {boolean} createIfNeeded - (optional) Create the note with the given filename if it doesn't exist (only project notes, v3.5.2+)
   * @return {Promise<TNote>} - When the note has been opened, a promise will be returned (use with await ... or .then())
   */
  openNoteByFilename(filename: string, newWindow?: boolean, highlightStart?: number, highlightEnd?: number, splitView?: boolean, createIfNeeded?: false): Promise<TNote | void>;
  openNoteByFilename(filename: string, newWindow?: boolean, highlightStart?: number, highlightEnd?: number, splitView?: boolean, createIfNeeded: true): Promise<TNote>;
  /**
   * Opens a note by searching for the give title (first line of the note)
   * Note: 'splitView' parameter available for macOS from v3.4
   * @param {string} title - Title (case sensitive) of the note (first line)
   * @param {boolean} newWindow - (optional) Open note in new window (default = false)?
   * @param {number} highlightStart - (optional) Start position of text highlighting
   * @param {number} highlightEnd - (optional) End position of text highlighting
   * @param {boolean} splitView - (optional) Open note in a new split view
   * @return {Promise<TNote>} - When the note has been opened, a promise will be returned
   */
  openNoteByTitle(title: string, newWindow?: boolean, highlightStart?: number, highlightEnd?: number, splitView?: boolean): Promise<TNote | void>;
  /**
   * Opens a note by searching for the give title (first line of the note)
   * Note: 'splitView' parameter available for macOS from v3.4
   * @param {string} title - Title (case sensitive) of the note (first line)
   * @param {boolean} newWindow - (optional) Open note in new window (default = false)?
   * @param {number} highlightStart - (optional) Start position of text highlighting
   * @param {number} highlightEnd - (optional) End position of text highlighting
   * @param {boolean} splitView - (optional) Open note in a new split view
   * @return {Promise<TNote>} - When the note has been opened, a promise will be returned
   */
  openNoteByTitleCaseInsensitive(
    title: string,
    newWindow?: boolean,
    caseSensitive?: boolean,
    highlightStart?: number,
    highlightEnd?: number,
    splitView?: boolean,
  ): Promise<TNote | void>;
  /**
   * Opens a calendar note by the given date
   * Note: 'splitView' parameter available for macOS from v3.4
   * Note: 'timeframe' parameter available for macOS from v3.6
   * @param {Date} date - The date that should be opened, this is a normal JavaScript date object
   * @param {boolean} newWindow - (optional) Open note in new window (default = false)?
   * @param {number} highlightStart - (optional) Start position of text highlighting
   * @param {number} highlightEnd - (optional) End position of text highlighting
   * @param {boolean} splitView - (optional) Open note in a new split view
   * @param {string} timeframe - (optional) Timeframe "day" (default) or "week"
   * @return {Promise<TNote>} - When the note has been opened, a promise will be returned
   */
  openNoteByDate(date: Date, newWindow?: boolean, highlightStart?: number, highlightEnd?: number, splitView?: boolean, timeframe?: string): Promise<TNote | void>;
  /**
   * Opens a calendar note by the given date string
   * Note: from v3.6 also accepts weeks in the main parameter
   * @param {string} dateString - The date string that should be opened, in ISO format for days ("YYYYMMDD") or (from v3.6) in "YYYY-Wnn" format for weeks
   * @param {boolean} newWindow - (optional) Open note in new window (default = false)?
   * @param {number} highlightStart - (optional) Start position of text highlighting
   * @param {number} highlightEnd - (optional) End position of text highlighting
   * @param {boolean} splitView - (optional) Open note in a new split view
   * @return {Promise<TNote>} - When the note has been opened, a promise will be returned
   */
  openNoteByDateString(filename: string, newWindow?: boolean, highlightStart?: number, highlightEnd?: number, splitView?: boolean): Promise<TNote | void>;
  /**
   * Opens a weekly calendar note by the given year and week number
   * Note: available from v3.6
   * @param {number} year           - The year of the week
   * @param {number} weeknumber     - The number of the week (0-52/53)
   * @param {boolean} newWindow     - (optional) Open note in new window (default = false)?
   * @param {number} highlightStart - (optional) Start position of text highlighting
   * @param {number} highlightEnd   - (optional) End position of text highlighting
   * @param {boolean} splitView     - (optional) Open note in a new split view
   * @return {Promise<void>}        - When the note has been opened, a promise will be returned
   */
  openWeeklyNote(year: number, weeknumber: number, newWindow?: boolean, highlightStart?: number, highlightEnd?: number, splitView?: boolean): Promise<TNote | void>;
  /**
   * Selects the full text in the editor.
   * Note: Available from v3.2
   */
  selectAll(): void;
  /**
   * (Raw) select text in the editor (like select 10 characters = length from position 2 = start)
   * Raw means here that the position is calculated with the Markdown revealed,
   * including Markdown links and folded text.
   * @param {number} start - Character start position
   * @param {number} length - Character length
   */
  select(start: number, length: number): void;
  /**
   * (Rendered) select text in the editor (like select 10 characters = length from position 2 = start)
   * Rendered means here that the position is calculated with the Markdown hidden,
   * including Markdown links and folded text.
   * @param {number} start - Character start position
   * @param {number} length - Character length
   */
  renderedSelect(start: number, length: number): void;
  /**
   * Copies the currently selected text in the editor to the system clipboard.
   * See also Clipboard object.
   * Note: Available from v3.2
   */
  copySelection(): void;
  /**
   * Pastes the current content in the system clipboard into the current selection in the editor.
   * See also Clipboard object.
   * Note: Available from v3.2
   */
  pasteClipboard(): void;
  /**
   * Scrolls to and highlights the given paragraph. If the paragraph is folded,
   * it will be unfolded.
   * @param {TParagraph} paragraph to highlight
   */
  highlight(paragraph: TParagraph): void;
  /**
   * Scrolls to and highlights the given range. If the paragraph is folded, it
   * will be unfolded.
   * @param {Range} range
   */
  highlightByRange(range: Range): void;
  /**
   * Scrolls to and highlights the given range defined by the character index and
   * the character length it should cover. If the paragraph is folded, it will be unfolded.
   * Note: Available from v3.0.23
   * @param {number} index
   * @param {number} length
   */
  highlightByIndex(index: number, length: number): void;
  /**
   * Folds the given paragraph or unfolds it if its already folded. If the paragraph is not a heading, it will look for the heading this paragraph exists under.
   * Note: Available from v3.6.0
   * @param {TParagraph}
   */
  toggleFolding(paragraph: TParagraph): void;
  /**
   * Checks if the given paragraph is folded or not. If it's not a heading, it will look for the heading this paragraph exists under.
   * Note: Available from v3.6.0
   * @param {TParagraph}
   * @return {boolean}
   */
  isFolded(paragraph: TParagraph): boolean;
  /**
   * Shows or hides a window with a loading indicator or a progress ring (if progress is defined) and an info text (optional).
   * `text` is optional, if you define it, it will be shown below the loading indicator.
   * `progress` is also optional. If it's defined, the loading indicator will change into a progress ring. Use float numbers from 0-1 to define how much the ring is filled.
   * When you are done, call `showLoading(false)` to hide the window.
   * Note: Available from v3.0.26
   * @param {boolean}
   * @param {string?}
   * @param {Float?}
   */
  showLoading(visible: boolean, text?: ?string, progress?: number): void;
  /**
   * If you call this, anything after `await CommandBar.onAsyncThread()` will run on an asynchronous thread.
   * Use this together with `showLoading`, so that the work you do is not blocking the user interface.
   * Otherwise the loading window will be also blocked.
   *
   * Warning: Don't use any user interface calls (other than showLoading) on an asynchronous thread. The app might crash.
   * You need to return to the main thread before you change anything in the window (such as Editor functions do).
   * Use `onMainThread()` to return to the main thread.
   * Note: Available from v3.0.26
   * @return {Promise}
   */
  onAsyncThread(): Promise<void>;
  /**
   * If you call this, anything after `await CommandBar.onMainThread()` will run on the main thread.
   * Call this after `onAsyncThread`, once your background work is done.
   * It is safe to call Editor and other user interface functions on the main thread.
   * Note: Available from v3.0.26
   * @return {Promise}
   */
  onMainThread(): Promise<void>;
  /**
   * Get the names of all supported themes (including custom themes imported into the Theme folder).
   * Use together with `.setTheme(name)`
   * Note: Available from v3.1
   * @return {$ReadOnlyArray<string>}
   */
  +availableThemes: $ReadOnlyArray<string>;
  /**
   * Change the current theme. Get all available theme names using `.availableThemes`. Custom themes are also supported. Use the filename in this case.
   * Note: Available from v3.1+
   * @param {string}
   */
  setTheme(name: string): void;
  /**
   * Add a new theme using the raw json string. It will be added as a custom theme and you can load it right away with `.setTheme(name)` using the filename defined as second parameter. Use ".json" as file extension.
   * It returns true if adding was successful and false if not. An error will be also printed into the console.
   * Adding a theme might fail, if the given json text was invalid.
   * Note: Available from v3.1
   * @param {string} json
   * @param {string} filename
   * @return {boolean}
   */
  addTheme(json: string, filename: string): boolean;
}

/**
 * With DataStore you can query, create and move notes which are cached by
 * NotePlan. It allows you to query a set of user preferences, too.
 */
type TDataStore = Class<DataStore>
declare class DataStore {
  // Impossible constructor
  constructor(_: empty): empty;
  /**
   * Get the preference for the default file (note) extension,
   * such as "txt" or "md".
   */
  static +defaultFileExtension: string;
  /**
   * Get all folders as array of strings. Including the root "/" and excluding
   * folders from Archive or Trash.
   */
  static +folders: $ReadOnlyArray<string>;
  /**
   * Get all calendar notes.
   * Note: from v3.4 this includes all future-referenced dates, not just those with
   * an actual created note.
   */
  static +calendarNotes: $ReadOnlyArray<TNote>;
  /**
   * Get all regular, project notes.
   */
  static +projectNotes: $ReadOnlyArray<TNote>;
  /**
   * Get all cached hashtags (#tag) that are used across notes.
   * It returns hashtags without leading '#'.
   * @type {Array<string>}
   * Note: Available from v3.6.0
   */
  static +hashtags: $ReadOnlyArray<string>;
  /**
   * Get all cached mentions (@name) that are used across notes.
   * It returns mentions without leading '@'.
   * Note: Available from v3.6.0
   * @type {Array<string>}
   */
  static +mentions: $ReadOnlyArray<string>;
  /**
   * Get list of all filter names
   * Note: Available from v3.6.0
   * @type {Array<string>}
   */
  static +filters: $ReadOnlyArray<string>;

  /**
   * Get or set settings for the current plugin (as a JavaScript object).
   * Example: settings.shortcutExpenses[0].category
   * Note: Available from v3.3.2
   */
  static settings: Object;

  /**
   * Returns the value of a given preference.
   * Available keys for built-in NotePlan preferences:
   *   "themeLight"              // theme used in light mode
   *   "themeDark"               // theme used in dark mode
   *   "fontDelta"               // delta to default font size
   *   "firstDayOfWeek"          // first day of calendar week
   *   "isAgendaVisible"         // only iOS, indicates if the calendar and note below calendar are visible
   *   "isAgendaExpanded"        // only iOS, indicates if calendar above note is shown as week (true) or month (false)
   *   "isAsteriskTodo"          // "Recognize * as todo" = checked in markdown preferences
   *   "isDashTodo"              // "Recognize - as todo" = checked in markdown preferences
   *   "isNumbersTodo"           // "Recognize 1. as todo" = checked in markdown preferences
   *   "defaultTodoCharacter"    // returns * or -
   *   "isAppendScheduleLinks"   // "Append links when scheduling" checked in todo preferences
   *   "isAppendCompletionLinks" // "Append completion date" checked in todo preferences
   *   "isCopyScheduleGeneralNoteTodos" // "Only add date when scheduling in notes" checked in todo preferences
   *   "isSmartMarkdownLink"     // "Smart Markdown Links" checked in markdown preferences
   *   "fontSize"                // Font size defined in editor preferences (might be overwritten by custom theme)
   *   "fontFamily"              // Font family defined in editor preferences (might be overwritten by custom theme)
   *   "timeblockTextMustContainString" // Optional text to trigger timeblock detection in a line
   * Others can be set by plugins.
   * Note: these keys and values do not sync across a user's devices; they are only local.
   */
  static +preference: (key: string) => mixed;
  /**
   * Change a saved preference or create a new one.
   * It will most likely be picked up by NotePlan after a restart, if you use one of the keys utilized by NotePlan.
   *
   * To change a NotePlan preference, use the keys found in the description of the function `.preference(key)`.
   * You can also save custom preferences specific to the plugin, if you need any.
   * repend it with the plugin id or similar to avoid collisions with existing keys.
   * Note: these keys and values do not sync across a user's devices; they are only local.
   * Note: Available from v3.1
   * @param {string}
   * @param {any}
   */
  static setPreference(key: string, value: mixed): void;
  /**
   * Save a JavaScript object to the Plugins folder as JSON file.
   * This can be used to save preferences or other persistent data.
   * It's saved automatically into a new folder "data" in the Plugins folder.
   * But you can "escape" this folder using relative paths: ../Plugins/<folder or filename>.
   * Note: Available from v3.1
   * @param {Object}
   * @param {string}
   * @return {boolean}
   */
  static saveJSON(object: Object, filename?: string): boolean;
  /**
   * Load a JavaScript object from a JSON file located (by default) in the <Plugin>/data folder.
   * But you can also use relative paths: ../Plugins/<folder or filename>.
   * Note: Available from v3.1
   * @param {string}
   * @return {Object}
   */
  static loadJSON(filename?: string): Object;
  /**
   * Save data to a file, as base64 string. The file will be saved under "[NotePlan Folder]/Plugins/data/[plugin-id]/[filename]".
   * Returns true if the file could be saved, false if not and prints the error.
   * Note: Available from v3.2.0
   * @param {string}
   * @param {string}
   * @return {booleanean}
   */
  static saveData(data: string, filename: string): boolean;
  /**
   * Load binary data from file encoded as base64 string.
   * The file has to be located in "[NotePlan Folder]/Plugins/data/[plugin-id]/[filename]".
   * You can access the files of other plugins as well, if the filename is known using relative paths "../[other plugin-id]/[filename]" or simply go into the "data"'s root directory "../[filename]" to access a global file.
   * Returns undefined, if the file couldn't be loaded and prints an error message.
   * Note: Available from v3.2.0
   * @param {string}
   * @return {string?}
   */
  static loadData(filename: string): ?string;
  /**
   * Returns the calendar note for the given date and timeframe (optional, the default is "day", use "week" for weekly notes).
   * Note: 'timeframe' available from v3.6.0
   * @param {Date}
   * @param {string?} - "day" (default), "week", "month" or "year"
   * @return {NoteObject}
   */
  static calendarNoteByDate(date: Date, timeframe?: string): ?TNote;
  /**
   * Returns the calendar note for the given date string (can be undefined, if the daily note was not created yet)
   * Use following format: "YYYYMMDD", example: "20210410"
   * For weekly notes use "YYYY-WDD", for example "2022-W24" (Note: available from v3.6.0)
   * @param {string}
   * @return {NoteObject}
   */
  static calendarNoteByDateString(dateString: string): ?TNote;
  /**
   * Returns all regular notes with the given title.
   * Since multiple notes can have the same title, an array is returned.
   * Use 'caseSensitive' (default = false) to search for a note ignoring
   * the case and set 'searchAllFolders' to true if you want to look for
   * notes in trash and archive as well.
   * By default NotePlan won't return notes in trash and archive.
   */
  static projectNoteByTitle(title: string, caseInsensitive?: boolean, searchAllFolders?: boolean): ?$ReadOnlyArray<TNote>;
  /**
   * Returns all regular notes with the given case insensitive title.
   * Note: Since multiple notes can have the same title, an array is returned.
   */
  static projectNoteByTitleCaseInsensitive(title: string): ?$ReadOnlyArray<TNote>;
  /**
   * Returns the regular note with the given filename with file-extension
   * (including folders if any, don't add "/" for root, though).
   */
  static projectNoteByFilename(filename: string): ?TNote;
  /**
   * Returns a regular or calendar note with the given filename.
   * Type can be "Notes" or "Calendar". Including the file extension.
   * Use "YYYYMMDD.ext" for calendar notes, like "20210503.txt".
   */
  static noteByFilename(filename: string, type: NoteType): ?TNote;
  /**
   * Move a regular note using the given filename (with extension) to another
   * folder. Use "/" for the root folder.
   * Returns the final filename; if the there is a duplicate, it will add a number.
   */
  static moveNote(noteName: string, folder: string): ?string;
  /**
   * Creates a regular note using the given title and folder.
   * Use "/" for the root folder.
   * It will write the given title as "# title" into the new file.
   * Returns the final filename; if the there is a duplicate, it will add a number.
   */
  static newNote(noteTitle: string, folder: string): ?string;
  /**
   * Creates a regular note using the given content, folder and filename. Use "/" for the root folder.
   * The content should ideally also include a note title at the top.
   * Returns the final filename with relative folder (`folder/filename.txt` for example).
   * If the there is a duplicate, it will add a number.
   * Alternatively, you can also define the filename as the third optional variable (v3.5.2+)
   * Note: available from v3.5, with 'filename' parameter added in v3.5.2
   * @param {string} content for note
   * @param {string} folder to create the note in
   * @param {string} filename of the new note (optional) (available from v3.5.2)
   * @return {string}
   */
  static newNoteWithContent(content: string, folder: string, filename?: string): string;

  /**
   * Returns an array of paragraphs having the same blockID like the given one (which is also part of the return array).
   * You can use `paragraph[0].note` to access the note behind it and make updates via `paragraph[0].note.updateParagraph(paragraph[0])` if you make changes to the content, type, etc (like checking it off as type = "done").
   * Note: Available from v3.5.2
   * @param {TParagraph}
   * @return {[TParagraph]}
   */
  static referencedBlocks(paragraph: TParagraph): TParagraph;

  /**
   * Loads all available plugins asynchronously from the GitHub repository and returns a list.
   * You can show a loading indicator using the first parameter (true) if this is part of some user interaction. Otherwise, pass "false" so it happens in the background.
   * Note: Available from v3.5.2
   * @param {boolean}
   */
  static listPlugins(showLoading: boolean): Promise<void>;
  /**
   * Installs a given plugin (load a list of plugins using `.listPlugins` first). If this is part of a user interfaction, pass "true" for `showLoading` to show a loading indicator.
   * Note: Available from v3.5.2
   * @param {PluginObject}
   * @param {boolean}
   */
  static installPlugin(pluginObject: PluginObject, showLoading: boolean): Promise<void>;
  /**
   * Returns all installed plugins as PluginObject(s).
   * Note: Available from v3.5.2
   * @return {Array<PluginObject>}
   */
  static installedPlugins(): Array<PluginObject>;
  /**
   * Invoke a given command from a plugin (load a list of plugins using `.listPlugins` first, then get the command from the `.commands` list).
   * If the command supports it, you can also pass an array of arguments which can contain any type (object, date, string, integer,...)
   * It returns the particular return value of that command which can be a Promise so you can use it with `await`.
   * Note: Available from v3.5.2
   * @param {PluginCommandObject}
   * @param {$ReadOnlyArray<mixed>}
   * @return {any} Return value of the command, like a Promise
   */
  static invokePluginCommand(command: PluginCommandObject, arguments: $ReadOnlyArray<mixed>): Promise<any>;
  /**
   * Invoke a given command from a plugin using the name and plugin ID, so you don't need to load it from the list.
   * If the command doesn't exist locally null will be returned with a log message.
   * If the command supports it, you can also pass an array of arguments which can contain any type (object, date, string, integer,...)
   * Note: Available from v3.5.2
   * @param {string}
   * @param {string}
   * @param {$ReadOnlyArray<mixed>}
   * @return {any} Return value of the command, like a Promise
   */
  static invokePluginCommandByName(command: string, pluginID: string, arguments?: $ReadOnlyArray<mixed>): Promise<any>;
  /**
   * Checks if the given pluginID is installed or not.
   * Note: Available from v3.6.0
   * @param {string}
   * @return {boolean}
   */
  static isPluginInstalledByID(pluginID: string): boolean;
  /**
   * Installs a given array of pluginIDs if needed. It checks online if a new version is available and downloads it.
   * Use it without `await` so it keeps running in the background or use it with `await` in "blocking mode" if you need to install a plugin as a dependency. In this case you can use `showPromptIfSuccessful = true` to show the user a message that a plugin was installed and `showProgressPrompt` will show a loading indicator beforehand. With both values set to false or not defined it will run in "silent" mode and show no prompts.
   * returns an object with an error code and a message { code: -1, message: "something went wrong" } for example. Anything code >= 0 is a success.
   * Note: Available from v3.6.0
   * @param {Array<string>} IDs
   * @param {boolean} showPromptIfSuccessful
   * @param {boolean} showProgressPrompt
   * @param {boolean} showFailedPrompt
   * @return {Promise<{number, string}>}
   */
  static installOrUpdatePluginsByID(
    pluginIDs: Array<string>,
    showPromptIfSuccessful: boolean,
    showProgressPrompt: boolean,
    showFailedPrompt: boolean,
  ): Promise<{ code: number, message: string }>;

  /**
   * Searches all notes for a keyword (uses multiple threads to speed it up).
   * By default it searches in project notes and in the calendar notes. Use the second parameters "types" to exclude a type. Otherwise, pass `null` or nothing.
   * This function is async, use it with `await`, so that the UI is not being blocked during a long search.
   * Optionally pass a list of folders (`inNotes`) to limit the search to notes that ARE in those folders (applies only to project notes). If empty, it is ignored.
   * Optionally pass a list of folders (`notInFolders`) to limit the search to notes NOT in those folders (applies only to project notes). If empty, it is ignored.
   * Searches for keywords are case-insensitive.
   * It will sort it by filename (so search results from the same notes stay together) and calendar notes also by filename with the newest at the top (highest dates).
   * Note: Available from v3.6.0
   * @param {string} = keyword to search for
   * @param {Array<string> | null?} types ["notes", "calendar"] (by default all, or pass `null`)
   * @param {Array<string> | null?} list (optional)
   * @param {Array<string> | null?} list (optional)
   * @param {boolean?} (optional) true to enable date-referenced items to be included in the search
   * @return {$ReadOnlyArray<TParagraph>} array of results
   */
  static search(
    keyword: string,
    types?: Array<string>,
    inFolders?: Array<string>,
    notInFolders?: Array<string>,
    shouldLoadDatedTodos?: boolean,
  ): Promise<$ReadOnlyArray<TParagraph>>;

  /**
   * Searches all project notes for a keyword (uses multiple threads to speed it up).
   * This function is async, use it with `await`, so that the UI is not being blocked during a long search.
   * Optionally pass a list of folders (`inNotes`) to limit the search to notes that ARE in those folders (applies only to project notes)
   * Optionally pass a list of folders (`notInFolders`) to limit the search to notes NOT in those folders (applies only to project notes)
   * Searches for keywords are case-insensitive.
   * Note: Available from v3.6.0
   * @param {string} = keyword to search for
   * @param {Array<string> | null?} folders list (optional)
   * @param {Array<string> | null?} folders list (optional)
   * @return {$ReadOnlyArray<TParagraph>} results array
   */
  static searchProjectNotes(keyword: string, inFolders?: Array<string>, notInFolders?: Array<string>): Promise<$ReadOnlyArray<TParagraph>>;

  /**
   * Searches all calendar notes for a keyword (uses multiple threads to speed it up).
   * This function is async, use it with `await`, so that the UI is not being blocked during a long search.
   * Note: Available from v3.6.0
   * @param {string} = keyword to search for
   * @param {boolean?} (optional) true to enable date-referenced items to be included in the search
   * @return {$ReadOnlyArray<TParagraph>} array of results
   */
  static searchCalendarNotes(keyword: string, shouldLoadDatedTodos?: boolean): Promise<$ReadOnlyArray<TParagraph>>;
}

/**
 * An object when trying to run a plugin Object
 */
type PluginCommandObject = {
  /**
   * Name of the plugin command (getter)
   */
  +name: string,
  /**
   * Description of the plugin command (getter)
   */
  +desc: string,
  /**
   * ID of the plugin this command belongs to (getter)
   */
  +pluginID: string,
  /**
   * Name of the plugin this command belongs to (getter)
   */
  +pluginName: string,
  /**
   * List of optional argument descriptions for the specific command (getter). Use this if you want to invoke this command from another plugin to inform the user what he nees to enter for example.
   */
  +arguments: $ReadOnlyArray<string>,
}

/**
 * An object that represents a plugin
 */
type PluginObject = {
  /**
   * ID of the plugin (getter)
   */
  +id: string,
  /**
   * Name of the plugin (getter)
   */
  +name: string,
  /**
   * Description of the plugin (getter)
   */
  +desc: string,
  /**
   * Author of the plugin (getter)
   */
  +author: string,
  /**
   * RepoUrl of the plugin (getter)
   */
  +repoUrl: ?string,
  /**
   * Release page URL of the plugin (on GitHub) (getter)
   */
  +releaseUrl: ?string,
  /**
   * Version of the plugin (getter)
   */
  +version: string,
  /**
   * This is the online data of the plugin. It might not be installed locally. (getter)
   */
  +isOnline: boolean,
  /**
   * Script filename that contains the code for this plugin (like script.js) (getter)
   */
  +script: string,
  /**
   * If this is a locally installed plugin, you can use this variable to check if an updated version is available online. (getter)
   */
  +availableUpdate: PluginObject,
  /**
   * A list of available commands for this plugin. (getter)
   * @type {PluginCommandObject}
   */
  +commands: PluginCommandObject,
}

/**
 * Use CommandBar to get user input. Either by asking the user to type in a
 * free-form string, like a note title, or by giving him a list of choices.
 * This list can be "fuzzy-search" filtered by the user. So, it's fine to show
 * a long list of options, like all folders or notes or tasks in a note.
 */
type TCommandBar = Class<CommandBar>
declare class CommandBar {
  // Impossible constructor
  constructor(_: empty): empty;
  /**
   * Get or set the current text input placeholder (what you can read when no
   * input is typed in) of the Command Bar.
   */
  static placeholder: string;
  /**
   * Get or set the current text input content of the Command Bar
   * (what the user normally types in).
   */
  static searchText: string;
  /**
   * Hides the Command Bar
   */
  static hide(): void;
  // show(): void,
  /**
   * Display an array of choices as a list (only strings) which the user can
   * "fuzzy-search" filter by typing something.
   *
   * The user selection is returned as a Promise.
   * So use it with `await CommandBar.showOptions(...)`.
   *
   * The result is a CommandBarResultObject (as Promise success result), which
   * has `.value` and `.index`.
   *
   * It only supports a string array as input for the options, so you might
   * need to map your list first to `Array<string>`.
   *
   * Use the `.index` attribute to refer back to the selected item in the
   * original array.
   */
  static showOptions<TOption: string = string>(options: $ReadOnlyArray<TOption>, placeholder: string): Promise<{ +index: number, +value: TOption }>;
  /**
   * Asks the user to enter something into the CommandBar.
   *
   * Use the "placeholder" value to display a question,
   * like "Type the name of the task".
   *
   * Use the "submitText" to describe what happens with the selection,
   * like "Create task named '%@'".
   *
   * The "submitText" value supports the variable "%@" in the string, that
   * NotePlan autofill with the typed text.
   *
   * It returns a Promise, so you can wait (using "await...") for the user
   * input with the entered text as success result.
   */
  static showInput(placeholder: string, submitText: string): Promise<string>;
  /**
   * Shows or hides a window with a loading indicator or a progress ring (if progress is defined) and an info text (optional).
   * `text` is optional, if you define it, it will be shown below the loading indicator.
   * `progress` is also optional. If it's defined, the loading indicator will change into a progress ring. Use float numbers from 0-1 to define how much the ring is filled.
   * When you are done, call `showLoading(false)` to hide the window.
   * Note: Available from v3.0.26
   * @param {boolean}
   * @param {string?}
   * @param {Float?}
   */
  static showLoading(visible: boolean, text?: string, progress?: number): void;
  /**
   * If you call this, anything after `await CommandBar.onAsyncThread()` will run on an asynchronous thread.
   * Use this together with `showLoading`, so that the work you do is not blocking the user interface.
   * Otherwise the loading window will be also blocked.
   *
   * Warning: Don't use any user interface calls (other than showLoading) on an asynchronous thread. The app might crash.
   * You need to return to the main thread before you change anything in the window (such as Editor functions do).
   * Use `onMainThread()` to return to the main thread.
   * Note: Available from v3.0.26
   */
  static onAsyncThread(): Promise<void>;
  /**
   * If you call this, anything after `await CommandBar.onMainThread()` will run on the main thread.
   * Call this after `onAsyncThread`, once your background work is done.
   * It is safe to call Editor and other user interface functions on the main thread.
   * Note: Available from v3.0.26
   */
  static onMainThread(): Promise<void>;

  /**
   * Show a native alert or confirm with title and message
   * Define at least one or more buttons for the user to select.
   * If you don't supply any buttons, an "OK" button will be displayed.
   * The promise returns selected button, with button index (0 - first button)
   * Note: Available from v3.3.2
   * @param {string}
   * @param {string}
   * @param {?$ReadOnlyArray<string>}
   */
  static prompt(title: string, message: string, buttons?: $ReadOnlyArray<string>): Promise<number>;

  /**
   * Show a native text input prompt to the user with title and message text.
   * The buttons will be "OK" and "Cancel".
   * You can supply a default value which will be pre-filled.
   * If the user selects "OK", the promise returns users entered value
   * If the user selects "Cancel", the promise returns false.
   * Note: Available from v3.3.2
   * @param {string}
   * @param {string?}
   * @param {string?}
   */
  static textPrompt(title: string, message: string, defaultValue: string): Promise<string | false>;
}

type CalendarDateUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

type DateRange = {
  +start: Date,
  +end: Date,
}

type ParsedTextDateRange = {
  /**
   * The start date of the parsed date text.
   */
  +start: Date,
  /**
   * The end date of the parsed date text. This might not be defined in the
   * date text. Then the end date = start date.
   *
   * If two time or dates are mentioned in the input string of
   * `Calendar.parseDateText(...)`, then the start and end dates will have the
   * respective times and dates set.
   */
  +end: Date,
  /**
   * The detected date string (e.g. the specific words that parseDate used to create a date/time)
   */
  +text: string,
  /**
   *  The character index of the start of the detected date string
   */
  +index: number,
}

type TCalendar = Class<Calendar>
/**
 * Use Calendar to create events, reminders, and to parse dates, like
 * - "tomorrow at 8am to 10am"
 * - "today"
 * - "1st May"
 *
 * See also `CalendarItem` if you want to create an event or reminder.
 */
declare class Calendar {
  // Impossible constructor
  constructor(_: empty): empty;
  /**
   * Get all available date units: "year", "month", "day", "hour", "minute", "second"
   */
  static +dateUnits: $ReadOnlyArray<CalendarDateUnit>;
  /**
   * Get the titles of all calendars the user has access to. Set `writeOnly` true, if you want to get only the calendars the user has write access to (some calendars, like holidays are not writable).
   * Note: Available from v3.1
   * @param {boolean}
   * @return {Array<string>}
   */
  static availableCalendarTitles(writeOnly: boolean): $ReadOnlyArray<string>;
  /**
   * Get the titles of all reminders the user has access to.
   * Note: Available from v3.1
   * @return {Array<string>}
   */
  static availableReminderListTitles(): $ReadOnlyArray<string>;
  /**
   * Create an event or reminder based on the given CalendarItem.
   * Returns the created CalendarItem with the assigned id, so you can
   * reference it later. If it failed, undefined is returned.
   */
  static add(item: TCalendarItem): TCalendarItem | void;
  /**
   * Parses a text describing a text as natural language input into a date. Such as "today", "next week", "1st May", "at 5pm to 6pm", etc.
   * Returns an array with possible results (usually one), the most likely at the top.
   * The possible values that can be accessed are:
   *   .start: time
   *   .end: time
   *   .index: character index of the start of the detected date string (available from v3.6.0)
   *   .text: the detected date string (available from v3.6.0)
   * Example:
   *    Calendar.parseDateText("* Next F1 race is Sun June 19 (Canadian GP)")
   * -> [{"index":18,"start":"2023-06-19T17:00:00.000Z","text":"Sun June 19 ","end":"2023-06-19T17:00:00.000Z"}]
   * Under the hood this uses the Chrono library.
   * IMPORTANT NOTE:
   * when .parseDate thinks something is an all-day event, it puts it at noon (both start/end at noon).
   * That means that these two (quite different) lines look identical in the return:
   *   - on Friday
   *   - on Friday at 12
   * The function helpers/dateTime.js::isReallyAllDay() can be used to disambiguate
   */
  static parseDateText(text: string): $ReadOnlyArray<ParsedTextDateRange>;
  /**
   * Create a date object from parts. Like year could be 2021 as a number.
   * Note: month uses Swift counting (1-12) not Javascript counting (0-11).
   */
  static dateFrom(year: number, month: number, day: number, hour: number, minute: number, second: number): Date;
  /**
   * Add a unit to an existing date. Look up all unit types using `dateUnits`.
   * For example, to add 10 days, use num = 10 and type = "day"
   */
  static addUnitToDate(date: Date, unit: CalendarDateUnit, num: number): Date;
  /**
   * Returns the integer of a unit like "year" (should be this year's number).
   * Look up all unit types using `dateUnits`.
   */
  static unitOf(date: Date, type: CalendarDateUnit): number;
  /**
   * Returns a description of how much time has past between the date and
   * today = now.
   */
  static timeAgoSinceNow(date: Date): string;
  /**
   * Returns the amount of units between the given date and now. Look up all
   * unit types using `dateUnits`.
   */
  static unitsUntilNow(date: Date, type: CalendarDateUnit): number;
  /**
   * Returns the amount of units from now and the given date. Look up all unit
   * types using `dateUnits`.
   */
  static unitsAgoFromNow(date: Date, type: CalendarDateUnit): number;
  /**
   * Returns the amount of units between the first and second date. Look up all
   * unit types using `dateUnits`.
   */
  static unitsBetween(date1: Date, date2: Date, type: CalendarDateUnit): number;
  /**
   * Returns all events between the `startDate` and `endDate`. Use `filter` to search for specific events (keyword in the title).
   * This function fetches events asynchronously, so use async/await.
   * Note: Available from v3.0.25
   * @param {Date}
   * @param {Date}
   * @param {string?}
   * @return {Promise}
   */
  static eventsBetween(startDate: Date, endDate: Date, filter?: ?string): Promise<Array<TCalendarItem>>;
  /**
   * Returns all reminders between the `startDate` and `endDate`. Use `filter` to search for specific reminders (keyword in the title).
   * This function fetches reminders asynchronously, so use async/await.
   * Note: Available from v3.0.25
   * @param {Date}
   * @param {Date}
   * @param {string?}
   * @return {Promise}
   */
  static remindersBetween(startDate: Date, endDate: Date, filter?: ?string): Promise<Array<TCalendarItem>>;
  /**
   * Returns all events for today. Use `filter` to search for specific events (keyword in the title).
   * This function fetches events asynchronously, so use async/await.
   * Note: Available from v3.0.25
   * @param {string?}
   * @return {Promise}
   */
  static eventsToday(filter: ?string): Promise<Array<TCalendarItem>>;
  /**
   * Returns all reminders between for today. Use `filter` to search for specific reminders (keyword in the title).
   * This function fetches reminders asynchronously, so use async/await.
   * Note: Available from v3.0.25
   * @param {string?}
   * @return {Promise}
   */
  static remindersToday(filter: ?string): Promise<Array<TCalendarItem>>;
  /**
   * Updates an event or reminder based on the given CalendarItem, which needs to have an ID.
   * A CalendarItem has an ID, when you have used `.add(...)` and saved the return value or when you query
   * the event using `eventsBetween(...)`, `remindersBetween(...)`, `eventByID(...)`, `reminderByID(...)`, etc.
   * Returns a promise, because it needs to fetch the original event objects first in the background,
   * then updates it. Use it with `await`.
   * Note: Available from v3.0.26
   * @param {CalendarItem}
   * @return {Promise}
   */
  static update(calendarItem: TCalendarItem): Promise<void>;
  /**
   * Removes an event or reminder based on the given CalendarItem, which needs to have an ID.
   * A CalendarItem has an ID, when you have used `.add(...)` and saved the return value or when you query
   * the event using `eventsBetween(...)`, `remindersBetween(...)`, `eventByID(...)`, `reminderByID(...)`, etc.
   * Returns a promise, because it needs to fetch the original event objects first in the background,
   * then updates it. Use it with `await`.
   * Note: Available from v3.0.26
   * @param {CalendarItem}
   * @return {Promise}
   */
  static remove(calendarItem: TCalendarItem): Promise<void>;
  /**
   * Returns the event by the given ID. You can get the ID from a CalendarItem, which you got from using `.add(...)` (the return value is a CalendarItem with ID) or when you query the event using `eventsBetween(...)`, `eventByID(...)`, etc.
   * This function fetches reminders asynchronously, so use async/await.
   * Note: Available from v3.0.26
   * @param {string}
   * @return {Promise(CalendarItem)}
   */
  static eventByID(id: string): Promise<TCalendarItem>;
  /**
   * Returns the reminder by the given ID. You can get the ID from a CalendarItem, which you got from using `.add(...)` (the return value is a CalendarItem with ID) or when you query the event using `remindersBetween(...)`, `reminderByID(...)`, etc.
   * Use with async/await.
   * Note: Available from v3.0.26
   * @param {string}
   * @return {Promise(CalendarItem)}
   */
  static reminderByID(id: string): Promise<TCalendarItem>;
  /**
   * Returns all reminders (completed and incomplete) for the given lists (array of strings).
   * If you keep the lists variable empty, NotePlan will return all reminders from all lists. You can get all Reminders lists calling `Calendar.availableReminderListTitles()`
   * This function fetches reminders asynchronously, so use async/await.
   * Note: Available from v3.5.2
   * @param {Array<string>?}
   * @return {Promise}
   */
  static remindersByLists(lists: $ReadOnlyArray<string>): Promise<Array<TCalendarItem>>;
}

/**
 * You can get paragraphs from `Editor` or `Note`.
 * They represent blocks or lines of text (delimited by linebreaks = \n).
 * A task for example is a paragraph, a list item (bullet), heading, etc.
 */
type TParagraph = Paragraph
declare interface Paragraph {
  // Impossible to create Paragraphs manually
  constructor(_: empty): empty;
  /**
   * Get or set the type of the paragraph
   */
  type: ParagraphType;
  /**
   * Returns the NoteObject behind this paragraph. This is a convenience method, so you don't need to use DataStore.
   * Note: Available from v3.5.2
   */
  +note: ?TNote;
  /**
   * Get or set the content of the paragraph
   * (without the Markdown 'type' prefix, such as '* [ ]' for open task)
   */
  content: string;
  /**
   * Get the content of the paragraph
   * (with the Markdown 'type' prefix, such as '* [ ]' for open task)
   */
  +rawContent: string;
  /**
   * Get the Markdown prefix of the paragraph (like '* [ ]' for open task)
   */
  +prefix: string;
  /**
   * Get the range of the paragraph.
   */
  +contentRange: Range | void;
  /**
   * Get the line index of the paragraph.
   */
  +lineIndex: number;
  /**
   * Get the date of the paragraph, if any (in case of scheduled tasks).
   */
  +date: Date | void;
  /**
   * Get the heading of the paragraph (looks for a previous heading paragraph).
   */
  +heading: string;
  /**
   * Get the heading range of the paragraph
   * (looks for a previous heading paragraph).
   */
  +headingRange: Range | void;
  /**
   * Get the heading level of the paragraph ('# heading' = level 1).
   */
  +headingLevel: number;
  /**
   * If the task is a recurring one (contains '@repeat(...)')
   */
  +isRecurring: boolean;
  /**
   * Get the amount of indentations.
   */
  +indents: number;
  /**
   * Get the filename of the note this paragraph was loaded from
   */
  +filename: ?string;
  /**
   * Get the note type of the note this paragraph was loaded from.
   */
  +noteType: ?NoteType;
  /**
   * Get the linked note titles this paragraph contains,
   * such as '[[Note Name]]' (will return names without the brackets).
   */
  +linkedNoteTitles: $ReadOnlyArray<string>;
  /**
   * Creates a duplicate object, so you can change values without affecting the
   * original object
   */
  duplicate(): Paragraph;
  /**
   * Returns indented paragraphs (children) underneath a task
   * Only tasks can have children, but any paragraph indented underneath a task
   * can be a child of the task. This includes bullets, tasks, quotes, text.
   * Children are counted until a blank line, HR, title, or another item at the
   * same level as the parent task. So for items to be counted as children, they
   * need to be contiguous vertically.
   * Important note: .children() for a task paragraph will return every child,
   * grandchild, greatgrandchild, etc. So a task that has a child task that has
   * a child task will have 2 children (and the first child will have one)
   * Note: Available from v3.3
   * @return {[TParagraph]}
   */
  children(): $ReadOnlyArray<TParagraph>;
  /**
   * Returns an array of all paragraphs having the same blockID (including this paragraph). You can use `paragraph[0].note` to access the note behind it and make updates via `paragraph[0].note.updateParagraph(paragraph[0])` if you make changes to the content, type, etc (like checking it off as type = "done")
   * Note: Available from v3.5.2
   * @type {[TParagraph]} - getter
   */
  +referencedBlocks: [TParagraph];
  /**
   * Returns the NoteObject behind this paragraph. This is a convenience method, so you don't need to use DataStore.
   * Note: Available from v3.5.2
   * @type {TNote?}
   */
  +note: ?TNote;
  /**
   * Returns the given blockId if any.
   * Note: Available from v3.5.2
   * @type {string?}
   */
  +blockId: ?string;
}

type TNote = Note
type NoteType = 'Calendar' | 'Notes'
/**
 * Notes can be queried by DataStore. You can change the complete text of the
 * note, which will be saved to file or query, add, remove, or modify
 * particular paragraphs (a paragraph is a task for example). See more
 * paragraph editing examples under Editor. NoteObject and Editor both
 * inherit the same paragraph functions.
 */
declare interface Note extends CoreNoteFields {
  /**
   * Optional date if it's a calendar note
   */
  +date: Date | void;
  /**
   * Date and time when the note was last modified.
   */
  +changedDate: Date;
  /**
   * Date and time of the creation of the note.
   */
  +createdDate: Date;
  /**
   * All #hashtags contained in this note.
   */
  +hashtags: $ReadOnlyArray<string>;
  /**
   * All @mentions contained in this note.
   */
  +mentions: $ReadOnlyArray<string>;
  /**
   * Get paragraphs contained in this note which contain a link to another [[project note]] or [[YYYY-MM-DD]] daily note.
   * Note: Available from v3.2.0
   */
  +linkedItems: $ReadOnlyArray<TParagraph>;
  /**
   * Get paragraphs contained in this note which contain a link to a daily note.
   * Specifically this includes paragraphs with >YYYY-MM-DD, @YYYY-MM-DD, <YYYY-MM-DD, >today, @done(YYYY-MM-DD HH:mm), but only in non-calendar notes (because currently NotePlan doesn't create references between daily notes).
   * Note: Available from v3.2.0
   */
  +datedTodos: $ReadOnlyArray<TParagraph>;
  /**
   * Get all backlinks pointing to the current note as Paragraph objects. In this array, the toplevel items are all notes linking to the current note and the 'subItems' attributes (of the paragraph objects) contain the paragraphs with a link to the current note. The heading of the linked paragraphs are also listed here, although they don't have to contain a link.
   * NB: Backlinks are all [[note name]] and >date links.
   * Note: Available from v3.2.0
   */
  +backlinks: $ReadOnlyArray<TParagraph>;
  /**
   * Get all types assigned to this note in the frontmatter as an array of strings.
   * You can set types of a note by adding frontmatter e.g. `type: meeting-note, empty-note` (comma separated).
   * Note: Available from v3.5.0
   */
  +frontmatterTypes: $ReadOnlyArray<string>;
}

/**
 * Ranges are used when you deal with selections or need to know where a
 * paragraph is in the complete text.
 */
declare var Range: TRange
declare interface TRange {
  /**
   * Character start index of the range. (Get or set.)
   */
  start: number;
  /**
   * Character end index of the range. (Get or set.)
   */
  end: number;
  /**
   * Character length of the range (end - start). (Get only.)
   */
  +length: number;
/**
 * Create an instance of a Range object with the start and end positions. 
 * The length variable is calculated automatically and doesn't have to be set.
 * Example: Range.create(0, 10) 
* @param {number} start
* @param {number} end
* @returns {Range}
*/
create(start: number, end: number): Range;
}

type CalenderItemType = 'event' | 'reminder'
/**
 * The CalendarItem is used in combination with
 * [Calendar](Editor)
 * to create events or reminders.
 */
declare var CalendarItem: TCalendarItem
declare interface TCalendarItem {
  /**
   * The ID of the event or reminder after it has been created by
   * `Calendar.add(calendarItem)`.
   *
   * The ID is not set in the original CalendarItem, you need to use the return
   * value of `Calendar.add(calendarItem)` to get it.
   *
   * Use the ID later to refer to this event (to modify or delete).
   */
  +id: ?string;
  /**
   * The title of the event or reminder.
   */
title: string;
  /**
   * The date (with time) of the event or reminder.
   */
date: Date;
  /**
   * The endDate (with time) of the event (reminders have no endDate).
   * So, this can be optional.
   */
endDate: ? Date;
  /**
   * The type of the calendar item, either "event" or "reminder". 
   * Cannot be set.
   */
  +type: string;
  /**
   * If the calendar item is all-day, means it has no specific time.
   */
isAllDay: boolean;
  /**
   * If the calendar item is completed. This applies only to reminders.
   * Note: Available from v3.0.15
   */
isCompleted: boolean;
  /**
   * All the dates the event or reminder occurs (if it's a multi-day event for example)
   * Note: Available from v3.0.15
   */
+occurrences: $ReadOnlyArray < Date >;
  /**
   * The calendar or reminders list where this event or reminder is (or should be) saved. If you set nothing, the event or reminder will be added to the default and this field will be set after adding.
   * Note: Available from v3.0.15.
   */
calendar: string;
  /**
   * Text saved in the "Notes" field of the event or reminder.
   * Note: Available from v3.0.26
   */
notes: string;
  /**
   * URL saved with the event or reminder.
   * Note: Available from v3.0.26
   */
url: string;
  /**
   * If supported, shows the availability for the event. The default is 0 = busy.
   * notSupported = -1
   * busy = 0
   * free = 1
   * tentative = 2
   * unavailable = 3
   * Note: Available from v3.3
   */
availability: number;
  /**
   * List of attendee names or emails.
   * Some example result strings show the variety possible:
   * - "[bob@example.com](mailto:bob@example.com)"
   * - "✓ [Jonathan Clark](/aOTg2Mjk1NzU5ODYyOTU3NUcglJxZek7H6BDKiYH0Y7RvgqchDTUR8sAcaQmcnHR_/principal/) (organizer)"
   * - "[TEST Contact1](mailto:test1@clarksonline.me.uk)",
   * But I think it is closer to being a JS Map [string, string].
   * Note: Available from v3.5.0
   */
attendees: Array < string >;
  /**
   * List of attendee names (or email addresses if name isn't available).
   * Note: Available from v3.5.2
   */
+attendeeNames: $ReadOnlyArray < string >;
  /**
   * Markdown link for the given event. If you add this link to a note, NotePlan will link the event with the note and show the note in the dropdown when you click on the note icon of the event in the sidebar.
   * Note: Available from v3.5, only events; reminders are not supported yet
   */
calendarItemLink: string;
/**
 * Location in the event
 * Note: Available from v3.5.2? for events
 */
location: string;
/**
 * Is this from a writeable calendar?
 * Note: get only
 */
+isCalendarWritable: boolean;
/**
 * Is the event part of a recurring series?
 * Note: get only
 */
+isRecurring: boolean;
  /**
   * Create a CalendarItem. The .endDate is optional, but recommended for events.
   * Reminders don't use this field.
   *
   * The type can be "event" or "reminder". 
   * And isAllDay can be used if you don't want to define a specific time, like holidays.
   * Use the calendar variable, if you want to add the event or reminder to another
   * calendar or reminders list other than the default. This is optional: if you set
   * nothing, it will use the default.
   * Use isCompleted only for reminders, by default it's false if you set nothing.
   * Note: some available from v3.0.26.
   */
  create(
    title: string,
    date: Date,
    endDate: Date | void,
    type: CalenderItemType,
    isAllDay?: boolean,
    calendar?: string,
    isCompleted?: boolean,
    notes?: string,
    url?: string,
    availability ?: number
  ): TCalendarItem;
}

/**
 * Access and set the data inside the current clipboard.
 * Note: See also 2 methods in the TEditor object.
 */
declare class Clipboard {
  // Impossible constructor
  constructor(_: empty): empty;
  /**
   * Get or set the current text of the clipboard.
   */
  static string: string;
  /**
   * Returns a list of types.
   */
  static +types: $ReadOnlyArray<string>;
  /**
   * Set the text of the clipboard using a specific type.
   */
  static setStringForType(string: string, type: string): void;
  /**
   * Get the text in the clipboard accessing a specific type.
   */
  static stringForType(type: string): ?string;
  /**
   * Set the data as base64 string for a specific type like an image or RTF.
   * Note: Available from v3.4.1
   * @param {string} base64String
   * @param {string} type
   */
  static setBase64DataStringForType(base64String: string, type: string): void;
  /**
   * Get the base64 data string for a specific type like an image or RTF from the clipboard.
   * Note: Available from v3.4.1
   * @param {string} type
   * @return {string}
   */
  static base64DataStringForType(type: string): string;
  /**
   * Get the data in the clipboard accessing a specific type.
   */
  static dataForType(type: string): mixed;
  /**
   * Set the data in the clipboard for a specific type.
   */
  static setDataForType(data: mixed, type: string): void;
  /**
   * Clears the contents of the clipboard.
   */
  static clearContents(): void;
  /**
   * Pass in the types you are interested in and get the available type back.
   */
  static availableType(fromTypes: $ReadOnlyArray<string>): ?string;
}

/* Available paragraph types
 * Note: 'separator' added v3.4.1
 */
type ParagraphType = 'open' | 'done' | 'scheduled' | 'cancelled' | 'title' | 'quote' | 'list' | 'empty' | 'text' | 'code' | 'separator'

type TCoreNoteFields = CoreNoteFields
declare interface CoreNoteFields {
  /**
   * Title = first line of the note. (NB: Getter only.)
   */
  +title: string | void;
  /**
   * Type of the note, either "Notes" or "Calendar".
   */
  +type: NoteType;
  /**
   * Get the filename of the note.
   * Folder + Filename of the note (the path is relative to the root of the chosen storage location)
   * From v3.6.0 can also *set* the filename, which does a rename.
   */
  filename: string;
  /**
   * Renames the note. You can also define a folder path. The note will be moved to that folder and the folder will be automatically created.
   * If the filename already exists, a number will be appended. If the filename begins with ".", it will be removed.
   * It returns the actual filename.
   * Note: Available from v3.6.1
   * @param {String} newFilename requested
   * @returns {String} actualFilename
  */
rename(newFilename: string): string;
  /**
   * Get or set the raw text of the note (without hiding or rendering any Markdown).
   * If you set the content, NotePlan will write it immediately to file.
   * If you get the content, it will be read directly from the file.
   */
  content: string | void;
  /**
   * Get or set the array of paragraphs contained in this note, such as tasks,
   * bullets, etc. If you set the paragraphs, the content of the note will be
   * updated.
   * TODO: Should this really be $ReadOnlyArray?
   */
  paragraphs: $ReadOnlyArray<TParagraph>;
  /**
   * Inserts the given text at the given character position (index)
   * Note: this is not quite the same as Editor.insertTextAtCharacterIndex()
   * @param text 	  - Text to insert
   * @param index   - Position to insert at (you can get this using 'renderedSelection' for example)
   */
  insertTextInCharacterIndex(text: string, index: number): void;
  /**
   * Replaces the text at the given range with the given text
   * Note: this is not quite the same name as Editor.replaceTextInCharacterRange()
   * @param text 	    - Text to insert
   * @param location  - Position to insert at (you can get this using 'renderedSelection' for example)
   * @param length    - Amount of characters to replace from the location
   */
  replaceTextAtCharacterRange(text: string, location: number, length: number): void;
  /**
   * Returns a range object of the full paragraph of the given character
   * position.
   */
  paragraphRangeAtCharacterIndex(characterPosition: number): Range;

  /**
   * Inserts a plain paragraph at the given line index
   */
  insertParagraph(name: string, lineIndex: number, type: ParagraphType): void;

  /**
   * Inserts a todo at the given line index
   */
  insertTodo(name: string, lineIndex: number): void;

  /**
   * Inserts a completed todo at the given line index
   */
  insertCompletedTodo(name: string, lineIndex: number): void;

  /**
   * Inserts a cancelled todo at the given line index
   */
  insertCancelledTodo(name: string, lineIndex: number): void;

  /**
   * Inserts a scheduled todo at the given line index
   */
  insertScheduledTodo(name: string, lineIndex: number, date: Date): void;

  /**
   * Inserts a quote at the given line index
   */
  insertQuote(name: string, lineIndex: number): void;

  /**
   * Inserts a list (bullet) item at the given line index
   */
  insertList(name: string, lineIndex: number): void;

  /**
   * Inserts a heading at the given line index
   */
  insertHeading(name: string, lineIndex: number, level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void;

  /**
   * Appends a todo at the end of the note
   */
  appendTodo(title: string): void;

  /**
   * Prepends a todo at the beginning of the note (after the title heading)
   */
  prependTodo(title: string): void;

  /**
   * Appends a paragraph at the end of the note
   */
  appendParagraph(title: string, type: ParagraphType): void;

  /**
   * Prepends a paragraph at the beginning of the note (after the title heading)
   */
  prependParagraph(title: string, type: ParagraphType): void;

  /**
   * Inserts a todo below the given title of a heading (at the beginning or end of existing text)
   * @param {string} title - Text of the todo
   * @param {string} headingTitle - Title of the heading (without '#  Markdown)
   * @param {boolean} shouldAppend - If the todo should be appended at the bottom of existing text
   * @param {boolean} shouldCreate - If the heading should be created if non-existing
   */
  addTodoBelowHeadingTitle(title: string, headingTitle: string, shouldAppend: boolean, shouldCreate: boolean): void;

  /**
   * Inserts a paragraph below the given title of a heading (at the beginning or end of existing text)
   * @param {string} title - Text of the paragraph
   * @param {ParagraphType} paragraphType
   * @param {string} headingTitle - Title of the heading (without '#  Markdown)
   * @param {boolean} shouldAppend - If the todo should be appended at the bottom of existing text
   * @param {boolean} shouldCreate - If the heading should be created if non-existing
   */
  addParagraphBelowHeadingTitle(title: string, paragraphType: ParagraphType, headingTitle: string, shouldAppend: boolean, shouldCreate: boolean): void;

  /**
   * Appends a todo below the given heading index (at the end of existing text)
   * @param {string} title - Text of the todo
   * @param {number} headingLineIndex - Line index of the heading (get the line index from a paragraph object)
   */
  appendTodoBelowHeadingLineIndex(title: string, headingLineIndex: number): void;

  /**
   * Appends a paragraph below the given heading index (at the end of existing text)
   * @param {string} title - Text of the paragraph
   * @param {paragraphType} paragraphType
   * @param {number} headingLineIndex - Line index of the heading (get the line index from a paragraph object)
   */
  appendParagraphBelowHeadingLineIndex(title: string, paragraphType: ParagraphType, headingLineIndex: number): void;

  /**
   * Inserts a todo after a given paragraph
   * @param {string} title - Text of the paragraph
   * @param {TParagraph} otherParagraph - Another paragraph, get it from `.paragraphs`
   */
  insertTodoAfterParagraph(title: string, otherParagraph: TParagraph): void;

  /**
   * Inserts a todo before a given paragraph
   * @param {string} title - Text of the paragraph
   * @param {TParagraph} otherParagraph - Another paragraph, get it from `.paragraphs`
   */
  insertTodoBeforeParagraph(title: string, otherParagraph: TParagraph): void;

  /**
   * Inserts a paragraph after a given paragraph
   * @param {string} title - Text of the paragraph
   * @param {TParagraph} otherParagraph - Another paragraph, get it from `.paragraphs`
   * @param {paragraphType} paragraphType
   */
  insertParagraphAfterParagraph(title: string, otherParagraph: TParagraph, paragraphType: ParagraphType): void;

  /**
   * Inserts a paragraph before a given paragraph
   * @param {string} title - Text of the paragraph
   * @param {TParagraph} otherParagraph - Another paragraph, get it from `.paragraphs`
   * @param {paragraphType} paragraphType
   */
  insertParagraphBeforeParagraph(title: string, otherParagraph: TParagraph, paragraphType: ParagraphType): void;

  /**
   * Removes a paragraph at a given line index
   * @param {number} lineIndex - Line index of the paragraph
   */
  removeParagraphAtIndex(lineIndex: number): void;

  /**
   * Removes a given paragraph
   * @param {TParagraph} paragraph - Paragraph object to remove, get it from `.paragraphs`
   */
  removeParagraph(paragraph: TParagraph): void;

  /**
   * Removes given paragraphs
   * @param {Array<TParagraph>} paragraphs - Array of Paragraph object to remove, get it from `.paragraphs`
   */
  removeParagraphs(paragraphs: $ReadOnlyArray<TParagraph>): void;

  /**
   * Updates a given paragraph. Get the paragraph, then modify it and update the text in the note or editor using this method.
   * @param {TParagraph} paragraph - Paragraph object to update, get it from `.paragraphs`
   */
  updateParagraph(paragraph: TParagraph): void;

  /**
   * Updates an array paragraphs. Get the paragraphs, then modify them and update the text in the note or editor using this method.
   * @param {Array<TParagraph>} paragraphs - Paragraph objects to update, get it from `.paragraphs`
   * TODO: Should this really be $ReadOnlyArray?
   */
  updateParagraphs(paragraphs: $ReadOnlyArray<TParagraph>): void;

  /**
   * Replaces the text at the given range with the given text
   * @param {string} text - Text to insert
   * @param {number} location - Position to insert at (you can get this using 'renderedSelection' for example)
   * @param {number} length - Amount of characters to replace from the location
   */
  replaceTextInCharacterRange(text: string, location: number, length: number): void;
  /**
   * Generates a unique block ID and adds it to the content of this paragraph.
   * Remember to call .updateParagraph(p) to write it to the note.
   * You can call this on the Editor or note you got the paragraph from.
   * Note: Available from v3.5.2
   * @param {TParagraph}
   */
  addBlockID(paragraph: TParagraph): void;

  /**
   * Removes the unique block ID, if it exists in the content.
   * Remember to call .updateParagraph(p) to write it to the note afterwards.
   * You can call this on the Editor or note you got the paragraph from.
   * Note: Available from v3.5.2
   * @param {TParagraph}
   */
  removeBlockID(paragraph: TParagraph): void;
  /**
   * Returns an array of paragraphs having the same blockID like the given one.
   * You can use 'paragraph [0].note to access the note behind it and make updates via `paragraph[0].note.updateParagraph(paragraph [0])` if you make changes to the content, type, etc (like checking it off as type = "done").
   * If you pass no paragraph as argument this will return all synced lines that are available.
   * Note: Available from v3.5.2
   * @param {TParagraph?}
   * @return {Array<TParagraph>}
   */
  referencedBlocks(paragraph?: TParagraph): Array<TParagraph>;
  /**
   * Print the note, optionally with backlinks and events sections
   * Note: available from v3.4 on macOS
   * @param {boolean} addReferenceSections
   */
  printNote(addReferenceSections: boolean): void;
}

declare class NotePlan {
  // Impossible constructor.
  constructor(_: empty): empty;
  /**
   * Returns the environment information from the operating system:
   * Available from v3.3.2:
   *   .languageCode: string?
   *   .regionCode: string?
   *   .is12hFormat: boolean
   *   .preferredLanguages: Array<string>
   *   .secondsFromGMT: integer
   *   .localTimeZoneAbbreviation: string
   *   .localTimeZoneIdentifier: string
   *   .isDaylightSavingTime: boolean
   *   .daylightSavingTimeOffset: Double
   *   .nextDaylightSavingTimeTransition: Date
   *   .platform: "macOS" | "iPadOS" | "iOS"
   *   .hasSettings: boolean
   * Available from v3.4.1:
   *   .templateFolder: string (this return path relative to NP's root folder, normally "@Templates")
   *   .version: string (NotePlan's version, for example "3.4.1". Note: it may contain alpha characters too, so it is not recommended for use in tests or comparisons)
   *   .versionNumber: number (NotePlan's version as integer,for example 341. JGC Note: this will return '36' for v3.6.0, and is not recommended for use in tests or comparisons)
   *   .buildVersion: number (NotePlan's build number as integer,for example 730. Note: This is the item recommended for use in tests or comparisons)
   */
  static +environment: Object;
  /**
   * The selected sidebar folder (useful when a note is not showing in Editor, which is then null)
   * Note: available from v3.5.1
   */
  static +selectedSidebarFolder?: string;
  /**
   * Open the current plugin's config UI, if available.
   * Note: available from v3.3.2 (just for macOS so far)
   */
  static showConfigurationView(): Promise<void>;
  /**
   * To reset the caches, particularly in the case where the sidebar turns out incorrect.
   * It's an async operation, but it doesn't return a promise to tell you when it's done.
   * Note: available from v3.5.0
   */
  static resetCaches(): void;
  /**
   * Note: Available from v3.5.2
   * Opens the given URL using the default browser (x-callback-urls can also be triggered with this).
   */
  static openURL(url: string): void;
}

// Every function made available must be assigned to `globalThis`
// This type ensures that only functions are made available as plugins
declare var globalThis: { [string]: () => mixed, document: mixed }

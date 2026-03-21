You are a senior frontend engineer and UI/UX designer.

Your task is to redesign an existing result modal into a modern financial summary dialog with a premium dark UI.

Important:
- Do not hardcode displayed values.
- The highlighted total amount is a dynamic value calculated on the previous screen.
- The currency dropdown must use the list of currencies already predefined in the system.
- The dropdown does not need icons or flags.
- The converted amount must be calculated dynamically based on the selected currency and the exchange rate returned by the API.
- The footer exchange rate information must also be populated from the API response.
- The UI should only present dynamic data provided by props/state/API, never fixed mock values in the final implementation.

## Layout Structure

Create a centered modal with the following structure:

### 1. Header
- Title: "Planner result"
- Close button (X) aligned to the top-right

### 2. Main Content
- Label: "Total spend"
- Large highlighted amount
  - This value comes from the previous screen
  - It represents the calculated total spend(this can't change on make conversion)
  - It must be the main visual focus of the modal
- Small supporting text below the amount showing the number of included expense items
  - Example: "4 expense item(s) included"
  - This value is dynamic too

### 3. Conversion Section
- This section need to be in another row below the main content.
- Label: "Convert to:"
- Currency dropdown
  - No icon required
  - Use the currencies already predefined in the application
  - Selecting a currency should update the converted amount

- Conversion result area
  - Show something like: "≈ Equates to"
  - Show the converted amount in a visually emphasized container
  - The converted amount must be calculated using:
    - the total spend value
    - the selected target currency
    - the exchange rate returned by the API

### 4. Footer Info
- Show exchange rate metadata returned by the API
- Example structure:
  - "Exchange rates from {rateDate}"
  - "1 {targetCurrency} = {exchangeRate} BRL"
- These values are dynamic and must not be hardcoded

### 5. Footer Action
- "Close" button aligned to the bottom-right


## Data Requirements

Assume the component receives or consumes data similar to:

- totalSpend
- expenseItemCount
- availableCurrencies
- selectedCurrency
- exchangeRate
- exchangeRateDate
- convertedAmount

Do not hardcode sample values in the implementation logic.

The final result should closely match a premium fintech modal, with the same visual hierarchy as the reference image, but fully driven by dynamic application data.


Follow tasks/frontend-task.md
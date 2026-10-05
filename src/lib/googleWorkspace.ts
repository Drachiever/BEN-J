import { Product, Order } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const CLIENT_ID = firebaseConfig.oAuthClientId;

// Load Google API Script dynamically
let gapiLoaded = false;
export function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gapiLoaded || (window as any).gapi) {
      gapiLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('picker', () => {
        gapiLoaded = true;
        resolve();
      });
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

/**
 * Open Google Picker to select an image from Google Drive / Google Photos
 */
export async function openGoogleDrivePicker(
  accessToken: string,
  onFilePicked: (file: { id: string; name: string; url: string; mimeType: string }) => void
): Promise<void> {
  await loadGapiScript();

  if (!(window as any).google || !(window as any).google.picker) {
    // Retry loading picker
    await new Promise((res) => (window as any).gapi.load('picker', res));
  }

  const pickerBuilder = new (window as any).google.picker.PickerBuilder()
    .addView((window as any).google.picker.ViewId.DOCS_IMAGES)
    .addView((window as any).google.picker.ViewId.DOCS)
    .setOAuthToken(accessToken)
    .setCallback((data: any) => {
      if (data.action === (window as any).google.picker.Action.PICKED) {
        const docPicked = data.docs[0];
        const fileId = docPicked.id;
        const fileUrl = docPicked.url || `https://drive.google.com/uc?id=${fileId}`;
        const webViewLink = docPicked.iconUrl || docPicked.thumbnails?.[0]?.url || fileUrl;
        
        onFilePicked({
          id: fileId,
          name: docPicked.name,
          url: webViewLink || fileUrl,
          mimeType: docPicked.mimeType
        });
      }
    });

  if (CLIENT_ID) {
    pickerBuilder.setAppId(CLIENT_ID.split('-')[0]);
  }

  const picker = pickerBuilder.build();
  picker.setVisible(true);
}

/**
 * Export current Product Inventory & Stock levels to a new Google Sheet on Google Drive
 */
export async function exportInventoryToGoogleSheet(
  accessToken: string,
  products: Product[],
  sheetTitle: string = 'Ben-J Classic Stock Inventory'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // Step 1: Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${sheetTitle} - ${new Date().toLocaleDateString()}`
      },
      sheets: [
        {
          properties: {
            title: 'Stock Levels',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Sheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Step 2: Populate Header and Product rows
  const rows = [
    ['Product ID', 'SKU', 'Product Name', 'Category', 'Price (GHS)', 'Cost Price (GHS)', 'Stock Level', 'Status', 'Last Updated']
  ];

  products.forEach((p) => {
    const status = p.stock <= 0 ? 'Out of Stock' : p.stock < 5 ? 'Low Stock' : 'In Stock';
    rows.push([
      p.id,
      p.sku,
      p.name,
      p.category,
      p.price.toString(),
      p.costPrice.toString(),
      p.stock.toString(),
      status,
      new Date().toISOString()
    ]);
  });

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Stock%20Levels!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Failed to write stock rows to Google Sheet');
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Sync stock levels from a linked Google Sheet back into the application products
 */
export async function syncStockFromGoogleSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<{ updatedCount: number; stockMap: Record<string, number> }> {
  // Fetch values from range
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Stock%20Levels!A2:G500`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to read from Google Sheet');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];
  const stockMap: Record<string, number> = {};
  let updatedCount = 0;

  rows.forEach((row) => {
    const productId = row[0]; // Product ID
    const sku = row[1]; // SKU
    const stockVal = parseInt(row[6], 10); // Column 7 is Stock Level

    if (!isNaN(stockVal)) {
      if (productId) stockMap[productId] = stockVal;
      if (sku) stockMap[sku] = stockVal;
      updatedCount++;
    }
  });

  return { updatedCount, stockMap };
}

/**
 * Save an Inventory Backup file directly to user's Google Drive
 */
export async function backupInventoryToDrive(
  accessToken: string,
  products: Product[],
  orders: Order[]
): Promise<{ fileId: string; webViewLink: string }> {
  const metadata = {
    name: `BenJ_Classic_Backup_${new Date().toISOString().slice(0, 10)}.json`,
    mimeType: 'application/json'
  };

  const backupData = JSON.stringify({ products, orders, exportedAt: new Date().toISOString() }, null, 2);

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([backupData], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to upload backup to Google Drive');
  }

  const file = await res.json();
  return { fileId: file.id, webViewLink: file.webViewLink };
}

const fields = {
  paid: 0,
  created_at: 1,
  name: 2,
  phone: 3,
  date: 4,
  time: 5,
  cake: [6, 7],
  letter: 8,
  taste: [10, 11, 12, 13],
  inner_taste: [14],
  bottom_taste: [15],
  size: 18,
  shape: [19, 20],
  color: [9, 16],
  sentence: 25,
  paid_sentence: [26, 27],
  toppings: 21,
  decorations: [22, 23, 24],
  social_name: 28,
  order_from: 29,
  delivery_method: 30,
  delivery_address: [31, 32],
  remarks: [33],
  printed_at: 89,
  printed: 90,
  // index: 91,
};

function lineIf(o, fields, opt) {
  const line = (
    fields
    .map(function (f, i) {
      if (opt && opt.overrides && opt.overrides[i]) {
        return opt.overrides[i](o[f], o)
      }
      if (o[f] instanceof Date) {
        return (o[f].getMonth() + 1) + '/' + o[f].getDate();
      }
      if (['shape', 'color', 'taste', 'letter', 'delivery_method'].includes(f)) {
        // if (o[f] && o[f].replace) {
        //   return o[f].replace(/\([^(\))]*\)/g, '')
        // }
        return o[f]
      }

      if (f === 'decorations') {
        // if (o[f] && o[f].replace) {
        //   return o[f]
        //     .replace(/\([^(\))]*\)/g, '')
        // }
        return o[f]
      }

      if (f === 'paid_sentence') {
        if (o[f] && o[f].replace) {

          return o[f].replace('寫字朱古力牌  *請✅及於⬇️下面(others)填寫朱古力牌想寫嘅字 ,', '')
        }
      }

      return o[f]
    })
    .filter(Boolean)
    .join(' ')
  )
  return (
    line.trim().length > 0 ? ((opt && opt.prefix) || '') + line.trim() + '\n' : ''
  );
}

function stylePattern(body, pattern, opt) {
  var range = body.findText(pattern);

  while (range !== null) {
    var text = range.getElement().asText();

    if (opt.background) {
      text.setBackgroundColor(range.getStartOffset(), range.getEndOffsetInclusive(), opt.background)
    }

    if (opt.underline) {
      text.setUnderline(range.getStartOffset(), range.getEndOffsetInclusive(), opt.underline)
    }

    if (opt.bold) {
      text.setBold(range.getStartOffset(), range.getEndOffsetInclusive(), opt.bold)
    }

    range = body.findText(pattern, range);
  }
}

function order2Str(order) {
  if (!order) return '';
  return (
    ((order['printed'] === true || order['printed'] === 'TRUE') ? '' : 'NEW\n') +
    // lineIf(order, ['index'], {
    //   prefix: '#'
    // }) +
    //    lineIf(order, ['paid'], {overrides: [function(val) {return ((val === true || val === 'TRUE') ? 'Paid' : 'NOT Paid')}]}) +
    lineIf(order, ['name', 'phone'], {
      prefix: '👨 '
    }) +
    lineIf(order, ['date', 'time'], {
      prefix: '🕐 '
    }) +
    lineIf(order, ['cake', 'size'], {
      prefix: '🎂 '
    }) +
    lineIf(order, ['decorations', 'toppings'], {
      prefix: '📿 ',
      overrides: [line => line ? line.split(/ *, */).filter(Boolean).join('\n   - ') : '']
    }) +
    lineIf(order, ['shape', 'color'], {
      prefix: '‎‎‎⠀⠀ '
    }) +
    lineIf(order, ['taste', 'letter'], {
      prefix: '‎‎⠀⠀ '
    }) +
    lineIf(order, ['inner_taste', 'bottom_taste'], {
      prefix: '‎‎⠀⠀ '
    }) +
    lineIf(order, ['sentence'], {
      prefix: '✍️️ '
    }) +
    lineIf(order, ['paid_sentence'], {
      prefix: '朱古力牌 ✍️️ '
    }) +
    lineIf(order, ['order_from', 'social_name'], {
      prefix: '📲 '
    }) +
    lineIf(order, ['delivery_method', 'delivery_address'], {
      prefix: '🚚 '
    }) +
    lineIf(order, ['remarks'])
  )
}

function get(row, col) {
  return [].concat(fields[col]).reduce(function (acc, c) {
    var res = row[c]
    if (col === 'time') {
      if (res instanceof Date) {
        res = res.getHours() + ':' + res.getMinutes()
      }
    }

    return acc ? `${acc}, ${res}` : res;
  }, '')
}

function exportAllOrdersOfTmwTmw() {
  const date = new Date()
  date.setDate(date.getDate() + 2)

  exportOrders({
    date: date
  })
}

function exportUnprintedOrdersOfTmwTmw() {
  const date = new Date()
  date.setDate(date.getDate() + 2)

  exportOrders({
    unprintedOnly: true,
    date: date
  })
}

function exportAllOrdersOfTmw() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
}

function exportUnprintedOrdersOfTmw() {
  const date = new Date()
  date.setDate(date.getDate() + 1)

  exportOrders({
    unprintedOnly: true,
    date: date
  })
}

function exportUnprintedOrdersOfTmwSingleCol() {
  const date = new Date()
  date.setDate(date.getDate() + 1)

  exportOrders({
    unprintedOnly: true,
    date: date,
  }, {
    numOfColumns: 1,
  })
}

function exportCustomOrders() {
  const [month, day] = Browser.inputBox('Orders Date', 'MM/DD', Browser.Buttons.OK_CANCEL).split('/').map(function (t) {
    return 0 + t
  });

  const columns = parseInt(Browser.inputBox('No. of columns', '1 or 2', Browser.Buttons.OK_CANCEL) || 1, 10)

  exportOrders({
    date: new Date(new Date().getYear(), month - 1, day),
  }, {
    numOfColumns: columns
  })
}

const resolveColumnIndex = (n) => (a = Math.floor(n / 26)) >= 0 ? resolveColumnIndex(a - 1) + String.fromCharCode(65 + (n % 26)) : '';

function exportOrders(filter, {
  output,
  numOfColumns = 2,
  unrecorded
} = {}) {
  const now = new Date()
  filter.paidOnly = true // Print only paid orders for now
  var sheet = SpreadsheetApp.getActiveSheet();

  let date = filter.date
  let month, day, year

  let reportName;
  if (date) {
    [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()]
    reportName = 'Orders for ' + month + '/' + day + (filter.paidOnly ? ' (Paid)' : ' (All)')
  }
  if (filter.index) {
    reportName = `Order for ${filter.index}`;
  }

  const range = sheet.getDataRange();
  const filterView = range.createFilter();
  const filterCriteriaByDate = SpreadsheetApp.newFilterCriteria().whenTextContains([`'${month}/${day}`])
  filterView.setColumnFilterCriteria(fields.date, filterCriteriaByDate);

  var data = (
    range.getValues()
    .map(function (o, index) {
      o.id = index;
      return o
    })
    .filter(function (o) {
      if (!filter.date) {
        return true;
      }


      var odate = get(o, 'date') || ''
      if (odate instanceof Date) {
        return odate.getMonth() + 1 == month && odate.getDate() == day
      }
      return (odate.replace('\'', '').trim() == month + '/' + day) || (odate.replace('\'', '').trim() == month + '/' + day + '/' + year)
    })
    .filter(function(o) {return (!filter.unprintedOnly) || !(get(o, 'printed') === 'TRUE' || get(o, 'printed') === true)})
    .filter(function (o) {
      return (!filter.paidOnly) || typeof get(o, 'paid') === 'string' ? 'TRUE' == get(o, 'paid') : get(o, 'paid')
    }) // paid
  );

  Logger.info(data.length)

  filterView.remove();

  const orders = []

  data.forEach(function (row) {
    const order = {}
    order.id = row.id
    Object.keys(fields).forEach(function (col) {
      var val = get(row, col)
      if (val.replace /*col === 'decorations'*/ ) {
        val = val
          .replace(/\(\+(\ *?)\$(\d|\.)*\)/g, '') // e.g. (+ $20)
          .replace(/\*\(推介\)(\ *)?/g, '')
          .replace(/\(FREE\)(\ *)?/g, '')
          .replace(/⚠.*⚠/g, '\n')
      }

      if (val) {
        order[col] = val
      }

    })
    if (order.printed) {
      this_day_has_printed_before = true;
    }
    if (filter.index && String(order.index) !== String(filter.index)) {
      return;
    }
    orders.push(order)
  })

  if (!unrecorded) {
    orders.forEach((order, index) => {
      if (order.paid) {
        sheet.getRange(resolveColumnIndex(fields.printed) + (order.id + 1)).setValue(true)
        sheet.getRange(resolveColumnIndex(fields.printed_at) + (order.id + 1)).setValue(now.toISOString())
      }
    })
  }

  Logger.info(orders.length)

  var doc = DocumentApp.create(reportName)

  var paper = {
    letter_size: [612.283, 790.866],
    tabloid_size: [790.866, 1224.57],
    legal_size: [612.283, 1009.13],
    statement_size: [396.85, 612.283],
    executive_size: [521.575, 756.85],
    folio_size: [612.283, 935.433],
    a3_size: [841.89, 1190.55],
    a4_size: [595.276, 841.89],
    a5_size: [419.528, 595.276],
    b4_size: [708.661, 1000.63],
    b5_size: [498.898, 708.661],
    receipt_size: [300, 300 * 1.5]
  };

  const numOfColumnsToPaper = {
    1: 'receipt_size',
    2: 'a4_size'
  }

  const paperSize = paper[numOfColumnsToPaper[numOfColumns]]

  var body = doc.getBody()
  if (paperSize) {
    body.setPageHeight(paperSize[1]).setPageWidth(paperSize[0])
  }
  body.editAsText().setFontSize(16)
  body.setMarginBottom(0);
  body.setMarginTop(0);
  body.setMarginLeft(0);
  body.setMarginRight(0);
  let cellsPerPage = 4;
  if (numOfColumns === 1) {
    cellsPerPage = 1;
  }
  orders.forEach(function (o, i) {
    if (i % cellsPerPage != 0) return;

    const rows = [];


    for (let offset = 0; offset < cellsPerPage; offset++) {
      // Logger.log(orders[i].index)
      if (offset % numOfColumns === 0) {
        rows.push([]);
      }
      rows[rows.length - 1].push(order2Str(orders[i + offset]) || '')

    }
    var table = body.appendTable(rows)
    table.setBorderColor('#ffffff')
    body.appendPageBreak()
  })

  stylePattern(body, '#\d+', {
    bold: true
  })
  stylePattern(body, '(NOT )?Paid', {
    bold: true
  })
  stylePattern(body, '\d{8}', {
    bold: true
  })
  //  stylePattern(body, '蠟燭', {background: '#ff0000'})
  //  stylePattern(body, '蠟燭刀叉碟套裝', {background: '#ffffff'})
  //  stylePattern(body, '.*(糕|餅)\ \d+.*', {bold: true})
  //  stylePattern(body, '生日插牌', {background: '#00ff00'})
  stylePattern(body, '寫名.*', {
    underline: true
  })

  doc.saveAndClose()

  var docRef = DriveApp.getFileById(doc.getId())
  var dailyFolder = DriveApp.getFoldersByName('Daily').next()
  if (!dailyFolder) {
      DriveApp.createFolder('Daily')
      dailyFolder = DriveApp.getFoldersByName('Daily').next()
  }
  dailyFolder.addFile(docRef)
  DriveApp.removeFile(docRef)

  var pdfRef = DriveApp.createFile(doc.getAs('application/pdf'))
  dailyFolder.addFile(pdfRef)
  pdfRef.setName(reportName)
  DriveApp.removeFile(pdfRef)
  pdfRef.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW)

  const downloadUrl = pdfRef.getDownloadUrl().replace('&gd=true', '')
  if (output === 'html') {
    return ContentService.createTextOutput(downloadUrl)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  if (output === 'json') {
    return ContentService.createTextOutput(JSON.stringify({
      'url': downloadUrl
    })).setMimeType(ContentService.MimeType.JSON);
  }


  var html = HtmlService.createHtmlOutput('<a target=\"_blank\" href=\"' + downloadUrl + '\">Download</a>')
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Download');
  return pdfRef;
}

function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  const tmw = new Date(new Date().setDate(new Date().getDate() + 1))
  const tmwTmw = new Date(new Date().setDate(new Date().getDate() + 2));

  const [month, day] = [tmw.getMonth() + 1, tmw.getDate()] // tomorrow
  const [month1, day1] = [tmwTmw.getMonth() + 1, tmwTmw.getDate()] // tomorrow
  var marbleMenuEntries = [
    // {name: "Export " + month + '/' + (day) + " orders (All)", functionName: "exportAllOrdersOfTmw"},
    {
      name: "Export " + month + '/' + (day) + " orders",
      functionName: "exportUnprintedOrdersOfTmwSingleCol"
    },
    {
      name: "Export " + month1 + '/' + (day1) + " orders",
      functionName: "exportAllOrdersOfTmwTmw"
    },
    {
      name: "Export Custom orders",
      functionName: "exportCustomOrders"
    }
  ];
  ss.addMenu("Marble", marbleMenuEntries);
};

function doGet({
  parameter = {}
} = {}) {
  return exportOrders({
    date: parameter.date ? new Date(parameter.date) : new Date(),
  }, {
    output: 'json',
    numOfColumns: 1,
    unrecorded: !parameter.update_status,
  })
}

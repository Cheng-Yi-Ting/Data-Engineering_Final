const MongoClient = require('mongodb').MongoClient;



/** Create index with mongodb**/
async function CreateIndex() {

  return new Promise(resolve => {

    MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
      if (err) throw err;
      db.collection('news', function (err, collection) {


        // Indexing the Entire Document (Wildcard Indexing)
        collection.createIndex({ "$**": "text" })
        console.log("CreateIndex Success")

      });
      db.close(); //關閉連線
      resolve();
    });
  });

}
async function Search(searchresult) {
  MongoClient.connect("mongodb://localhost:27017/mymondb", function (err, db) {
    if (err) throw err;
    db.collection('news', function (err, collection) {

      collection.find({ $text: { $search: searchTerm } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).toArray(function (err, items) {
        if (err) throw err;
        console.log("We found " + items.length + " results!");
        return items
        // for (var i = 0; i < items.length; i++) {
        //   console.log(items[i].url);
        // }
        db.close(); //關閉連線
      });
    });
  });
}










module.exports = {
  CreateIndex, Search
}

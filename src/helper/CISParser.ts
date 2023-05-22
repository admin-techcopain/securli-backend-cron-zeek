import { fail } from "assert";
import path from "path"
import * as fs from "fs";
import { parse } from "node-html-parser";
import {
  Category,
  CISControls,
  CISFinalResponse,
  Header,
  Policy,
  PResult,
} from "../controller/types";
export const CISParser = (filepath: string): CISFinalResponse => {
  var cisData = [];
// let originalFileName=filepath get file by javascritp path.basename
let originalFileName=path.basename(filepath)

  var buffer;
  try {
    buffer = fs.readFileSync(filepath);
  } catch (err) {
    console.log("Function Name - CISParser ", Date(), err );
  }

  const root = parse(buffer.toString());
  var reprotContainer = root.querySelector("#reportContainer");
  const filesParts = filepath.split("/");
  var Host = filesParts[filesParts.length - 1].split("-")[0];
  var pageTitle =
    reprotContainer.querySelector("#coverPageTitle").firstChild.innerText;
  var targetIP = reprotContainer
    .querySelector("#coverPageTitle")
    .getElementsByTagName("ul")[0]
    .getElementsByTagName("li")[0]
    .innerText.replace("Target IP Address: ", "");
  var CISfileName = reprotContainer
    .querySelector("#coverPageSubTitle")
    .getElementsByTagName("h2")[0].innerText;
  var CISprofile = reprotContainer
    .querySelector("#coverPageSubTitle")
    .getElementsByTagName("ul")[0]
    .getElementsByTagName("li")[0].innerText;
  var scanDate = reprotContainer
    .querySelector("#coverPageSubTitle")
    .getElementsByTagName("ul")[0]
    .getElementsByTagName("li")[1].innerText;
  var detailsContainer = reprotContainer.querySelector("#detailsContainer");
  var detailsTable = detailsContainer.getElementsByTagName("table")[0];
  let assessmentDetails = reprotContainer.querySelector(
    "#assessmentDetailsArea"
  );
  let pass: any = 0,
    failed: any = 0,
    error: any = 0,
    total: any = 0,
    unknown: any = 0,
    man: any = 0,
    score: any = 0,
    max: any = 0,
    percentage: any = 0;
  detailsTable.getElementsByTagName("tbody").forEach((element) => {
    var totalNode = element.getElementsByTagName("th")[0].parentNode;
    if (element.getElementsByTagName("th")[0].innerText == "Total") {
      console.log("found");
      pass = totalNode.getElementsByTagName("td")[0].innerText;
      failed = totalNode.getElementsByTagName("td")[1].innerText;
      error = totalNode.getElementsByTagName("td")[2].innerText;
      unknown = totalNode.getElementsByTagName("td")[3].innerText;
      man = totalNode.getElementsByTagName("td")[4].innerText;
      score = totalNode.getElementsByTagName("td")[5].innerText;
      max = totalNode.getElementsByTagName("td")[6].innerText;
      percentage = totalNode.getElementsByTagName("td")[7].innerText;
    }
  });
  var currentCategory = new Category();
  var currentsequence = "0";
  var subsequenceseries = 0;
  var matchFound = false;
  detailsTable
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr")
    .forEach((element) => {
      let itemName: any = element
        .getElementsByTagName("td")[0]
        .text.trimStart();
      let seqnumber: any = itemName.split(" ")[0];
      if (
        parseInt(currentsequence) + 1 == seqnumber ||
        currentsequence == "0"
      ) {
        if (currentsequence != "0") {
          cisData.push(currentCategory);
          currentCategory = new Category();
          subsequenceseries = 0;
        }
        currentsequence = seqnumber;
        currentCategory.ItemName = itemName;
        currentCategory.ItemNo = currentsequence;
        currentCategory.SubCategory = [];
        currentCategory.PolicyResult = new PResult(
          element.getElementsByTagName("td")[1].text,
          element.getElementsByTagName("td")[2].text,
          element.getElementsByTagName("td")[3].text,
          element.getElementsByTagName("td")[4].text,
          element.getElementsByTagName("td")[5].text,
          element.getElementsByTagName("td")[6].text,
          element.getElementsByTagName("td")[7].text,
          element.getElementsByTagName("td")[8].text
        );
      } else if (
        seqnumber.includes(".") &&
        parseInt(currentsequence) + 1 != seqnumber &&
        seqnumber.split(".").length - 1 == 1
      ) {
        currentCategory.SubCategory.push(
          new Category(
            itemName,
            seqnumber,
            new PResult(
              element.getElementsByTagName("td")[1].text,
              element.getElementsByTagName("td")[2].text,
              element.getElementsByTagName("td")[3].text,
              element.getElementsByTagName("td")[4].text,
              element.getElementsByTagName("td")[5].text,
              element.getElementsByTagName("td")[6].text,
              element.getElementsByTagName("td")[7].text,
              element.getElementsByTagName("td")[8].text
            ),
            [],
            []
          )
        );
        currentCategory.SubCategory[subsequenceseries].SubCategory = [];
        subsequenceseries = subsequenceseries + 1;
      } else if (seqnumber.split(".").length - 1 > 1) {
        currentCategory.SubCategory[subsequenceseries - 1].SubCategory.push(
          new Category(
            itemName,
            seqnumber,
            new PResult(
              element.getElementsByTagName("td")[1].text,
              element.getElementsByTagName("td")[2].text,
              element.getElementsByTagName("td")[3].text,
              element.getElementsByTagName("td")[4].text,
              element.getElementsByTagName("td")[5].text,
              element.getElementsByTagName("td")[6].text,
              element.getElementsByTagName("td")[7].text,
              element.getElementsByTagName("td")[8].text
            ),
            [],
            []
          )
        );
      } else {
        cisData.push(currentCategory);
        currentCategory = new Category();
        subsequenceseries = 0;
      }
    });
  var assesmentsResultsTable = detailsContainer.getElementById(
    "assessmentResultTable"
  );
  var assesmentsResultsTableBody =
    assesmentsResultsTable.getElementsByTagName("tbody")[0];
  var assesmentsResultsTableBodyRows =
    assesmentsResultsTableBody.getElementsByTagName("tr");

  let policyCollection = [];

  assesmentsResultsTableBodyRows.forEach((rows) => {
    let colums = rows.getElementsByTagName("td");
    if (colums.length == 3 && colums[1] != null) {
      policyCollection.push({
        Name: colums[1].text,
        Result: colums[2].text,
      });
    }
  });
  console.log("done");
  //1.1.1 Ensure 'Enforce password history' is set to '24 or more password(s)'

  policyCollection.forEach((policyObject) => {
    matchFound = false;
    let policyObjectItemNo = policyObject.Name.split(" ")[0].split(".")[0];
    for (let parentloop = 0; parentloop < cisData.length; parentloop++) {
      let exitParent = false;
      let parentCategory = cisData[parentloop];
      let parentCategoryItemNo = parentCategory.ItemNo;
      if (parentCategoryItemNo == policyObjectItemNo) {
        if (parentCategory.SubCategory.length == 0) {
          if (parentCategory.Policies == null) {
            parentCategory.Policies = [];
          }
          if (
            parentCategory.PolicyResult.Max > parentCategory.Policies.length &&
            policyObject.Name.split(" ")[0]
          ) {
            let policy = AddPolicy(
              parentCategory,
              policyObject.Name.split(" ")[0],
              policyObject.Name,
              policyObject.Result,
              0
            );
            if (policy != null) {
              parentCategory.Policies.push(policy);

              exitParent = true;
              break;
            }
            if (matchFound) {
              exitParent = true;
              break;
            }
            if (
              parentCategory.PolicyResult.Max ==
                parentCategory.Policies.length &&
              matchFound
            ) {
              exitParent = true;
              break;
            }
          }
        }
        for (let i = 0; i < parentCategory.SubCategory.length; i++) {
          let subCat = parentCategory.SubCategory[i];
          if (subCat.Policies == null) {
            subCat.Policies = [];
          }
          if (
            subCat.PolicyResult.Max > subCat.Policies.length &&
            policyObject.Name.split(" ")[0]
          ) {
            let policy = AddPolicy(
              subCat,
              policyObject.Name.split(" ")[0],
              policyObject.Name,
              policyObject.Result,
              0
            );
            if (policy != null) {
              subCat.Policies.push(policy);

              exitParent = true;
              break;
            }
            if (matchFound) {
              exitParent = true;
              break;
            }
            if (
              subCat.PolicyResult.Max == subCat.Policies.length &&
              matchFound
            ) {
              exitParent = true;
              break;
            }
          }
        }
        if (exitParent) {
          break;
        }
      }
    }
  });
  function AddPolicy(
    subcat: { SubCategory: string | any[]; ItemNo: any },
    ItemNo: string,
    PolicyName: any,
    Result: any,
    iteration: number
  ) {
    try {
      if (subcat.SubCategory != null && subcat.SubCategory.length > 0) {
        while (!matchFound) {
          iteration = iteration + 1;
          if (subcat.SubCategory[iteration - 1] == null) {
            break;
          }
          var policy = AddPolicy(
            subcat.SubCategory[iteration - 1],
            ItemNo,
            PolicyName,
            Result,
            iteration
          );
          if (policy != null) {
            if (subcat.SubCategory[iteration - 1].Policies == null) {
              subcat.SubCategory[iteration - 1].Policies = [];
            }
            subcat.SubCategory[iteration - 1].Policies.push(policy);
            return;
          }
        }
      }

      let parentSeries = ItemNo.substring(0, ItemNo.lastIndexOf("."));
      if (subcat.ItemNo == parentSeries) {
        let cisContorlElements = getCISControlElements(ItemNo);
        let policy = new Policy(
          PolicyName, 
          ItemNo, 
          Result, 
          cisContorlElements.policyCISControlData, 
          cisContorlElements.description, 
          cisContorlElements.rationale,
          cisContorlElements.impact);

        matchFound = true;
        return policy;
      }
    } catch (err) {
      console.log(subcat);
      console.log("Function Name - AddPolicy ", Date(), err );
    }
  }
  function getCISControlElements(ItemNo) {
    let elements = [];
    let policyCISControls = {
      "description":"",
      "rationale":"",
      "impact":"",
      policyCISControlData : []
  };

    let controlsIndex = assessmentDetails
      .getElementsByTagName("div")
      .findIndex(
        (x) =>
          x.text
            .trimStart()
            .trimEnd()
            .replace("Pass", "")
            .replace("Fail", "")
            .split(" ")[0] == ItemNo
      );
    if (controlsIndex > 0) {
        // let descriptionText = '';
        // let rationaleText = "";
      let div = assessmentDetails.getElementsByTagName("div")[controlsIndex];
      let childdivs = div.getElementsByTagName('div');
      childdivs.forEach(childDiv=>{
          if(childDiv.classNames == "description")
          {
              policyCISControls.description = childDiv.innerText;
          }
          if(childDiv.classNames == "rationale")
          {
              policyCISControls.rationale = childDiv.innerText;
          }
          if(childDiv.classNames == "fixtext")
          {
              let elements = childDiv.getElementsByTagName('p');
              policyCISControls.impact = childDiv.getElementsByTagName('p')[4].innerText;
          }
      
      });

      let tags = div.getElementsByTagName("p");
      tags.forEach((tag) => {
        if (
          tag.text.includes("CIS Controls V7.0:") ||
          tag.text.includes("CIS Critical Security Controls V8.0:")
        ) {
          elements.push(tag);
        }
      });
        elements.forEach((cisElement) => {
            console.log("cisElement.length", cisElement?.getElementsByTagName("li").length)
            for (let z = 0; z < cisElement?.getElementsByTagName("li").length; z++) {
                let control = cisElement
                    .getElementsByTagName("li")[z]
                    .text.split("-- More")[0]
                    .trimStart()
                    .trimEnd();
                let subContorl = "";
                let label = "";
                let subControlTable = cisElement.getElementsByTagName("table")[z];
                let subControlTableRows = subControlTable.getElementsByTagName("tr");
                for (
                    let rowCount = 0;
                    rowCount <= subControlTableRows.length;
                    rowCount++
                ) {
                    let columns =
                        subControlTableRows[rowCount].getElementsByTagName("td");
                    if (columns.length == 2) {
                        if (
                            columns[0].text.trimStart() == "Subcontrol:" ||
                            columns[0].text.trimStart() == "Safeguard:"
                        ) {
                            subContorl = columns[1].text;
                        }
                        if (columns[0].text.trimStart() == "Label:") {
                            label = columns[1].text;
                            break;
                        }
                    }
                }

                //let txt = cisElement.getElementsByTagName('li')[0].text;
                if (
                    cisElement
                        .getElementsByTagName("span")[z]
                        .text.includes("CIS Controls V7.0:")
                ) {
                    policyCISControls.policyCISControlData.push(
                        new CISControls("CIS Controls V7.0:", control, subContorl, label)
                    );
                } else {
                    policyCISControls.policyCISControlData.push(
                        new CISControls(
                            "CIS Critical Security Controls V8.0:",
                            control,
                            subContorl,
                            label
                        )
                    );
                }
            }
        });
    }
    return policyCISControls;
  }

  let headerData = new Header(
    Host,
    CISfileName,
    originalFileName,
    scanDate,
    max,
    pass,
    failed,
    error,
    unknown,
    man,
    score,
    max,
    percentage,
    "UploadDate",
    CISprofile,
    targetIP
  );
  const finalResponse: CISFinalResponse = {
    Header: headerData,
    CISData: cisData,
  };

  console.log("\nCFile processing completed:");
  return finalResponse;
};
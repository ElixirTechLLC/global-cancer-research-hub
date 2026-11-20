// Chromosome (cytogenetic) change information shown on disease pages. Each statement was checked against the source it cites
// on 2026-11-20. `filter` links an item to a chromosome filter in the trial finder (labels in CHROMOSOME_CHANGES, cancers.js).
window.CHROMOSOME_INFO = {
 "leukemia": {
  "intro": [
   {
    "text": "Leukemia cells often carry changes in their chromosomes that are not present in the rest of the body. Whole chromosomes can be gained (trisomy) or lost (monosomy), a piece can be missing (deletion), flipped (inversion), or moved to another chromosome (translocation).",
    "cites": [
     {
      "label": "MedlinePlus Genetics: Changes in the number of chromosomes",
      "url": "https://medlineplus.gov/genetics/understanding/mutationsanddisorders/chromosomalconditions/"
     },
     {
      "label": "MedlinePlus Genetics: Changes in the structure of chromosomes",
      "url": "https://medlineplus.gov/genetics/understanding/mutationsanddisorders/structuralchanges/"
     }
    ]
   },
   {
    "text": "These changes are looked for at diagnosis using chromosome analysis (karyotyping) and FISH, alongside gene mutation testing. The results help define the type of leukemia, estimate how it is likely to behave, and in some cases point to a specific treatment.",
    "cites": [
     {
      "label": "NCI PDQ: Acute Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
     },
     {
      "label": "NCI PDQ: Acute Lymphoblastic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq"
     }
    ]
   }
  ],
  "items": []
 },
 "leukemia/aml": {
  "intro": [],
  "items": [
   {
    "name": "t(8;21) and inv(16)",
    "text": "Together called core-binding factor AML. Both are placed in the favorable-risk group of the European LeukemiaNet (ELN) 2022 classification.",
    "cites": [
     {
      "label": "NCI PDQ: Acute Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
     },
     {
      "label": "Shimony, Stahl & Stone, AML 2025 update (reproduces the ELN 2022 risk table). Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11966364/"
     }
    ],
    "filter": "t(8;21)"
   },
   {
    "name": "t(15;17)",
    "text": "Creates the PML::RARA fusion gene and defines acute promyelocytic leukemia (APL), which is treated differently from other AML.",
    "cites": [
     {
      "label": "NCI PDQ: Acute Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
     }
    ],
    "filter": "t(15;17)"
   },
   {
    "name": "Trisomy 8",
    "text": "An extra copy of chromosome 8 is a common chromosome change in AML. When no favorable-risk or adverse-risk genetic changes are found with it, it falls in the ELN 2022 intermediate-risk group.",
    "cites": [
     {
      "label": "Kristensen et al., Trisomy 8 in AML. Blood Cancer J 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12394636/"
     },
     {
      "label": "Shimony, Stahl & Stone, AML 2025 update (reproduces the ELN 2022 risk table). Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11966364/"
     }
    ],
    "filter": "Trisomy 8"
   },
   {
    "name": "Monosomy 7, del(5q) and 17p abnormalities",
    "text": "Loss of chromosome 7, loss of chromosome 5 or its long arm, and abnormalities of 17p are all classified as adverse risk by ELN 2022.",
    "cites": [
     {
      "label": "Shimony, Stahl & Stone, AML 2025 update (reproduces the ELN 2022 risk table). Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11966364/"
     }
    ],
    "filter": "Monosomy 7"
   },
   {
    "name": "Complex karyotype",
    "text": "Three or more unrelated chromosome abnormalities. It is classified as adverse risk and is often accompanied by TP53 mutation.",
    "cites": [
     {
      "label": "Shimony, Stahl & Stone, AML 2025 update (reproduces the ELN 2022 risk table). Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11966364/"
     },
     {
      "label": "Rücker et al., TP53 alterations in AML with complex karyotype. Blood 2012",
      "url": "https://pubmed.ncbi.nlm.nih.gov/22186996/"
     }
    ],
    "filter": "Complex karyotype"
   },
   {
    "name": "11q23 (KMT2A) rearrangements",
    "text": "Translocations involving the KMT2A gene at 11q23. ELN 2022 places t(9;11) in the intermediate-risk group and other KMT2A rearrangements in the adverse-risk group; the menin inhibitor revumenib is a targeted treatment approved in the United States for KMT2A-rearranged leukemia that has come back or not responded to treatment.",
    "cites": [
     {
      "label": "Shimony, Stahl & Stone, AML 2025 update (reproduces the ELN 2022 risk table). Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11966364/"
     },
     {
      "label": "NCI PDQ: Acute Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
     }
    ],
    "filter": "11q23 / KMT2A rearrangement"
   },
   {
    "name": "Normal karyotype",
    "text": "Roughly half of adults with AML have no visible chromosome change. In these cases gene mutations such as NPM1, FLT3 and CEBPA determine the risk group.",
    "cites": [
     {
      "label": "NCI PDQ: Acute Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
     },
     {
      "label": "Shimony, Stahl & Stone, AML 2025 update (reproduces the ELN 2022 risk table). Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11966364/"
     }
    ]
   }
  ]
 },
 "leukemia/all": {
  "intro": [],
  "items": [
   {
    "name": "Philadelphia chromosome, t(9;22)",
    "text": "Creates the BCR::ABL1 fusion gene. It is found in about a quarter of adults with ALL but only a few percent of children, and is treated with tyrosine kinase inhibitors.",
    "cites": [
     {
      "label": "Roberts, Genetics and prognosis of ALL in children vs adults. Hematology (ASH Education Program) 2018",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6245970/"
     },
     {
      "label": "NCI PDQ: Childhood Acute Lymphoblastic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/child-all-treatment-pdq"
     }
    ],
    "filter": "Philadelphia chromosome t(9;22)"
   },
   {
    "name": "High hyperdiploidy",
    "text": "Leukemia cells with 51 to 65 chromosomes. It is found in roughly a quarter of children with ALL and is associated with a favorable outcome.",
    "cites": [
     {
      "label": "NCI PDQ: Childhood Acute Lymphoblastic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/child-all-treatment-pdq"
     },
     {
      "label": "Roberts, Genetics and prognosis of ALL in children vs adults. Hematology (ASH Education Program) 2018",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6245970/"
     }
    ],
    "filter": "Hyperdiploidy"
   },
   {
    "name": "t(12;21) ETV6::RUNX1",
    "text": "Found in about a quarter of children with ALL and associated with a favorable outcome. It is uncommon in adults (under 5%).",
    "cites": [
     {
      "label": "Roberts, Genetics and prognosis of ALL in children vs adults. Hematology (ASH Education Program) 2018",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6245970/"
     },
     {
      "label": "NCI PDQ: Childhood Acute Lymphoblastic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/child-all-treatment-pdq"
     }
    ]
   },
   {
    "name": "Hypodiploidy",
    "text": "Leukemia cells with fewer than 44 chromosomes. It is uncommon in children, becomes more frequent with age, and is associated with a poor outcome.",
    "cites": [
     {
      "label": "NCI PDQ: Childhood Acute Lymphoblastic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/child-all-treatment-pdq"
     },
     {
      "label": "Roberts, Genetics and prognosis of ALL in children vs adults. Hematology (ASH Education Program) 2018",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6245970/"
     }
    ],
    "filter": "Hypodiploidy"
   },
   {
    "name": "11q23 (KMT2A) rearrangements",
    "text": "Found in most infants with ALL (up to 80%), in only a few percent of older children, and in about 15% of adults. It is associated with a poor outcome.",
    "cites": [
     {
      "label": "NCI PDQ: Childhood Acute Lymphoblastic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/child-all-treatment-pdq"
     },
     {
      "label": "Roberts, Genetics and prognosis of ALL in children vs adults. Hematology (ASH Education Program) 2018",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6245970/"
     }
    ],
    "filter": "11q23 / KMT2A rearrangement"
   }
  ]
 },
 "leukemia/cll": {
  "intro": [],
  "items": [
   {
    "name": "del(13q)",
    "text": "The most common chromosome change in CLL, found in about half of patients. When it is the only abnormality the outlook is favorable.",
    "cites": [
     {
      "label": "Döhner et al., Genomic aberrations and survival in CLL. N Engl J Med 2000",
      "url": "https://pubmed.ncbi.nlm.nih.gov/11136261/"
     },
     {
      "label": "NCI PDQ: Chronic Lymphocytic Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/cll-treatment-pdq"
     }
    ],
    "filter": "del(13q)"
   },
   {
    "name": "Trisomy 12",
    "text": "An extra copy of chromosome 12, found in roughly 15% of patients, with an intermediate outlook.",
    "cites": [
     {
      "label": "Döhner et al., Genomic aberrations and survival in CLL. N Engl J Med 2000",
      "url": "https://pubmed.ncbi.nlm.nih.gov/11136261/"
     },
     {
      "label": "Hallek, CLL 2025 update. Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11803567/"
     }
    ],
    "filter": "Trisomy 12"
   },
   {
    "name": "del(11q)",
    "text": "Found in roughly 15 to 20% of patients. It often removes the ATM gene and is associated with enlarged lymph nodes and faster progression.",
    "cites": [
     {
      "label": "Döhner et al., Genomic aberrations and survival in CLL. N Engl J Med 2000",
      "url": "https://pubmed.ncbi.nlm.nih.gov/11136261/"
     },
     {
      "label": "Hallek, CLL 2025 update. Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11803567/"
     }
    ],
    "filter": "del(11q)"
   },
   {
    "name": "del(17p)",
    "text": "Removes the TP53 gene. It is found in under 10% of patients at diagnosis, more often after treatment, and predicts poor response to chemoimmunotherapy, so targeted drugs are used.",
    "cites": [
     {
      "label": "Hallek, CLL 2025 update. Am J Hematol 2025",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11803567/"
     },
     {
      "label": "Malcikova et al., ERIC recommendations for TP53 analysis in CLL, 2024 update. Leukemia 2024",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11217004/"
     }
    ],
    "filter": "del(17p)"
   },
   {
    "name": "Complex karyotype",
    "text": "Three or more chromosome abnormalities. It is linked to a worse outcome mainly when there are five or more abnormalities, or when a TP53 abnormality is also present.",
    "cites": [
     {
      "label": "Baliakas et al., Cytogenetic complexity in CLL. Blood 2019",
      "url": "https://pubmed.ncbi.nlm.nih.gov/30602617/"
     }
    ],
    "filter": "Complex karyotype"
   }
  ]
 },
 "leukemia/cml": {
  "intro": [],
  "items": [
   {
    "name": "Philadelphia chromosome, t(9;22)",
    "text": "Present in more than 95% of people with CML. It joins the BCR and ABL1 genes, producing the abnormal protein that tyrosine kinase inhibitors block.",
    "cites": [
     {
      "label": "NCI PDQ: Chronic Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/cml-treatment-pdq"
     }
    ],
    "filter": "Philadelphia chromosome t(9;22)"
   },
   {
    "name": "Additional chromosome abnormalities",
    "text": "Extra changes in the Philadelphia-positive cells, such as trisomy 8, a second Philadelphia chromosome, isochromosome 17q or trisomy 19, are a warning sign of progression and are counted as high-risk features by the European LeukemiaNet.",
    "cites": [
     {
      "label": "Hochhaus et al., ELN 2020 CML recommendations. Leukemia 2020",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7214240/"
     },
     {
      "label": "NCI PDQ: Chronic Myeloid Leukemia Treatment (Health Professional Version)",
      "url": "https://www.cancer.gov/types/leukemia/hp/cml-treatment-pdq"
     }
    ],
    "filter": "Trisomy 8"
   }
  ]
 }
};

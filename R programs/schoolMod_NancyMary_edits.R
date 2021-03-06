library(stringr)
library(plyr)
library(gtools)
library(reshape)
library(ggmap)
library(rgdal)
library(zoo)
### Functions ###
money<-function(x) {
  x<-(sub("\\$","",x))
}
numeric<- function(x) {
  x<-as.numeric(gsub(",","",x))
}
addressClean<-function(x) {
  x<-gsub("Street| street| ST","St",x)
  x<-gsub("Avenue| Av ","Ave",x)
  x<-gsub("Place","Pl",x)
  x<-gsub("Road","Rd",x)
  x<-gsub("Martin Luther King Jr","Martin Luther King",x)
  x<-gsub("(Main Office)|\n| |[[:punct:]]","",x)
  x<-tolower(x)
}
textedit<-function (x) {
  x<-tolower(x)
  x<-gsub("pcs| es| ES| ms|MS| HS|[[:punct:]]","",x)
  x<-gsub("[[:space:]]","",x)
}

### read in data ### 
### read in data ### 
### read in data ###
#Nancy's corrected 
dcFull<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/Output%20Data/Old/DCSchoolsMaster_213_21CSF_edits.csv",
          stringsAsFactors=FALSE, strip.white=TRUE)[-c(35)]
dcFull<-subset(dcFull,dcFull$School!="")

#Nancy's corrected from 3-8
nancyNewEdits<-read.csv("https://raw.githubusercontent.com/katerabinowitz/school-modernization/master/InputData/DC_Schools_Master_214-NH-Corrected-38.csv",
                     stringsAsFactors=FALSE, strip.white=TRUE)[c(1:4,6:7,10,16)]
colnames(nancyNewEdits)[c(3)]<-"Name"
nancyNewEdits<-subset(nancyNewEdits,nancyNewEdits$Name!="DCPS MultiSchool")

#source data for updates
enroll<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/2014-15%20Enrollment%20Audit.csv",
                 stringsAsFactors=FALSE, strip.white=TRUE)[c(1,4:21,25:30)]

closedCharter<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/PCS_MasterClosed_210%203_14%202.csv",
                           stringsAsFactors=FALSE, strip.white=TRUE)[-c(5)]

charterFuture<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/FAc%20Allowance%201999-2021-Table%201.csv",
                        stringsAsFactors=FALSE, strip.white=TRUE)[c(1,3:8)]
charterFuture<-subset(charterFuture,charterFuture$Master.PCS.List.1998.2014.15!="")

CharterDataSheet<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/Appendix%20B_Public%20Charter%20Facility%20Data%20Sheet%20for%20SY14-15%20NH.csv",
                           stringsAsFactors=FALSE, strip.white=TRUE)[c(1:5,7:9)]
colnames(CharterDataSheet)<-c("LEA.Code","School.ID","School","Level","Address","maxOccupancy","totalSQFT", "Total.Enroll")
CharterDataSheet<-subset(CharterDataSheet,grepl("^[[:digit:]]",CharterDataSheet$LEA.Code))

#New charter cap data
charterHSCap<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/HS%20Facts%20SY14-15%20Appendix4.csv",
                       stringsAsFactors=FALSE, strip.white=TRUE,skip=2)[c(1:3,9)]
charterHSCap<-subset(charterHSCap,charterHSCap$School.Address..SY14.15!="")

charterMSCap<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/MS%20Facts%20SY14-15%20Appendix4.csv",
                       stringsAsFactors=FALSE, strip.white=TRUE,skip=2)[c(1:3,9)]
charterMSCap<-subset(charterMSCap,charterMSCap$School.Address..SY14.15!="")

charterESCap<-read.csv("https://raw.githubusercontent.com/codefordc/school-modernization/master/InputData/ES%20Facts%20SY14-15%20Appendix4.csv",
                       stringsAsFactors=FALSE, strip.white=TRUE,skip=2)[c(1:3,9)]
charterESCap<-subset(charterESCap,charterESCap$School.Address..SY14.15!="")
charterESCap$School.ID[charterESCap$School.ID == ""] <- NA
charterESCap$School.ID  <- na.locf(charterESCap$School.ID )
colnames(charterESCap)[c(4)]<-"Programmatic.Capacity..SY14.152"

charterCap<-rbind(charterESCap,charterMSCap,charterHSCap)
charterCap$Programmatic.Capacity..SY14.152<-gsub("[[:punct:]]","",charterCap$Programmatic.Capacity..SY14.152)
charterCap<-charterCap[order(charterCap$School.Address..SY14.15),]
charterCap$addressMatch<-addressClean(charterCap$School.Address..SY14.15)
charterCap$Agency<-rep("PCS",139)
charterCap<-charterCap[!duplicated(charterCap$addressMatch),][c(4:6)]
rm(charterESCap,charterMSCap,charterHSCap)

###add back in school code###
###add back in school code###
###add back in school code###
attach(dcFull)
schoolCode<-enroll[c(2:3)]
dcFull$School.Name<-dcFull$School
join01<-join(schoolCode,dcFull,by="School.Name", type="inner")
join01<-subset(join01,!(is.na(join01$School.ID)))
missDC<-subset(dcFull,!(dcFull$School.Name %in% join01$School.Name))
missDC$School.Name<-ifelse(missDC$School.Name=="School-Within-School at Goding",
                           "School Within School at Goding",
                           ifelse(missDC$School.Name=="Bunker Hill ES","Brookland EC at Bunker Hill",
                                  missDC$School.Name))

missDC1<-subset(missDC,(!(is.na(missDC$Total.Enrolled))) & missDC$Address!="2801 Calvert St NW"
                | missDC$School=="Incarcerated Youth Program")

missDC2<-subset(missDC,(is.na(missDC$Total.Enrolled)) | missDC$Address=="2801 Calvert St NW"
                & missDC$School!="Incarcerated Youth Program")

missEnroll<-subset(schoolCode, !(schoolCode$School.Name %in% join01$School.Name))
missEnroll<-subset(missEnroll,missEnroll$School.ID!="160")

missDC1<-missDC1[order(missDC1$School.Name),]
missEnroll<-missEnroll[order(missEnroll$School.Name),]
miss<-cbind(missEnroll, missDC1)[-c(37)]

missDC2$School.ID<-ifelse(missDC2$School.Name=="Oyster-Adams Bilingual School",292,NA)

dcFull<-rbind(join01,miss,missDC2)[-c(2)]
rm(miss, missDC, missDC1, missDC2,join01, missEnroll,schoolCode)

### fixes from Mary 3-8 ###
### fixes from Mary 3-8 ###
### fixes from Mary 3-8 ###
#remove unnecessary columns + rows
dcFull<-subset(dcFull,!(grepl("bowen|mmwashingtion|DCPS MultiSchool|Incarcerated Youth|Youth Services Center|Dorothy Height",
                            dcFull$School)))
#fill in address#
dcFull$Address<-ifelse(dcFull$School=="brucemonroe-demolished","3012 Georgia Ave NW",
                  ifelse(dcFull$School=="garnettpatterson","2001 10th St NW",
                    ifelse(dcFull$School=="macfarland","4400 Iowa Ave NW",
                      ifelse(dcFull$School=="Malcolmx","1351 Alabama Ave SE",
                        ifelse(dcFull$School=="marshall","3100 Fort Lincoln Drive SE",
                          ifelse(dcFull$School=="prharris","4600 Livingston Rd SE",
                            ifelse(dcFull$School=="rhterrell","1000 1st St NW",
                              ifelse(dcFull$School=="ronbrown","4800 Meade St NE",
                                ifelse(dcFull$School=="rudolph","5200 2nd St NW",
                                 ifelse(dcFull$School=="shaw","925 Rhode Island Ave NW",
                                    ifelse(dcFull$School=="Mamiedlee","100 Galatin St NE",
                                   dcFull$Address)))))))))))

#correct maxOccupancy where necessary for DCPS#
dcFull$maxOccupancy<-ifelse(dcFull$School=="McKinley MS",340,
                            ifelse(dcFull$School=="ronbrown",500,
                                   dcFull$maxOccupancy))

#bring in new maxOccupancy numbers for charters
dcFull$addressMatch<-addressClean(dcFull$Address)
#correct for charters that are in same building but address is one-off
dcFull$addressMatch<-ifelse(grepl("Capital City",dcFull$School),"100peabodystnw",
                          ifelse(grepl("Preparatory Benning",dcFull$School),"10041ststne",
                            ifelse(grepl("Parkside",dcFull$School),"3701hayesstne",
                                ifelse(grepl("Washington Latin",dcFull$School),"52002ndstnw",
                                  dcFull$addressMatch ))))

dcFull<-join(dcFull,charterCap,by=c("Agency","addressMatch"), type="left")
dcFull$maxOccupancy<-ifelse(!(is.na(dcFull$Programmatic.Capacity..SY14.152)),
                            dcFull$Programmatic.Capacity..SY14.152,dcFull$maxOccupancy)
rm(charterCap)

#correct or fill in level where necessary #
dcFull$Level<-ifelse(dcFull$School=="Ballou STAY","ADULT",
                ifelse(dcFull$School=="Bunker Hill ES","ES/MS",
                  ifelse(dcFull$School=="Burroughs ES","ES/MS",
                    ifelse(dcFull$School=="garnettpatterson","MS",
                      ifelse(dcFull$School=="macfarland","MS",
                        ifelse(dcFull$School=="McKinley MS","MS",
                          ifelse(dcFull$School=="ronbrown","HS",
                            ifelse(dcFull$School=="Roosevelt STAY","ADULT",
                              dcFull$Level))))))))

#correct SQFT for shared schools/buildings
dcFull$totalSQFT<-numeric(dcFull$totalSQFT)
dcFull$unqBuilding<-ifelse((grepl("Bridges",dcFull$School)),0,dcFull$unqBuilding)
toFix0<-subset(dcFull,dcFull$unqBuilding==0 & dcFull$Agency=="PCS")
toMerge<-CharterDataSheet[c(3,5,7)]
colnames(toMerge)<-c("Name","Address","SQFT")
Fix0<-join(toFix0,toMerge,by=c("Address"), type="left")
Fix0$totalSQFT<-Fix0$SQFT
Fix0<-subset(Fix0,!(grepl("Perry Street Preparatory",Fix0$Name)))[c(1:37)]

toFix1<-subset(dcFull,dcFull$unqBuilding!=0 & dcFull$Agency=="PCS")
toFix1$totalSQFT<- na.locf(toFix1$totalSQFT)

noFix<-subset(dcFull,dcFull$Agency!="PCS")
dcFull<-rbind(Fix0,toFix1,noFix)
dcFull<-dcFull[order(dcFull$School),]

rm(toFix0,Fix0,toFix1,noFix,toMerge)

#Update project type, year, and feederHS with Nancy's new field
DCPS<-subset(dcFull,dcFull$Agency=="DCPS")[-c(6,7,10,19)]
PCS<-subset(dcFull,dcFull$Agency!="DCPS")
Project<-subset(nancyNewEdits,nancyNewEdits$Agency=="DCPS")
colnames(Project)[c(6)]<-"YrComplete"
dcFullUp<-join(DCPS, Project,by=c("Agency","School.ID","Address"),type="inner")

missDCPS<-subset(DCPS,!(DCPS$School %in% dcFullUp$School))
missDCPS$School<-ifelse(missDCPS$School=="Malcolmx","Malcolm X",missDCPS$School)
missDCPS<-missDCPS[order(missDCPS$School),]
missProject<-subset(Project,!(Project$Name %in% dcFullUp$Name))
miss<-cbind(missDCPS,missProject)[-c(34:35,37)]

DCPSProject<-rbind(dcFullUp,miss)[-c(34)]
dcFull<-rbind(DCPSProject,PCS)
rm(DCPS,PCS,Project,dcFullUp,missDCPS,missProject,miss,DCPSProject,nancyNewEdits)

#Feeder MS updates
dcFull$FeederMS<-ifelse(dcFull$School=="Randle Highlands ES","Sousa MS",
               ifelse(dcFull$School=="Shepherd ES","Deal MS",
                      dcFull$FeederMS))

#fix Eaton & Roosevelt Stay
dcFull$Total.Enrolled<-ifelse(dcFull$School=="Eaton ES",475,dcFull$Total.Enrolled)
dcFull$Limited.English.Proficient<-ifelse(dcFull$School=="Eaton ES",43,
                                          ifelse(dcFull$School=="Roosevelt STAY",11,
                                                 dcFull$Limited.English.Proficient))
dcFull$At_Risk<-ifelse(dcFull$School=="Eaton ES",26,
                       ifelse(dcFull$School=="Roosevelt STAY",0,
                              dcFull$At_Risk))
dcFull$SPED<-ifelse(dcFull$School=="Eaton ES",35,
                    ifelse(dcFull$School=="Roosevelt STAY",49,
                           dcFull$SPED))

#add Nancy's select new majorExp and Lifetime Budget
dcFull$MajorExp9815<-ifelse(dcFull$School=="Luke Moore HS","$16,352,780",
                      ifelse(dcFull$School=="Patterson ES","$32,570,942",
                        ifelse(dcFull$School=="Phelps ACE HS","$66,594,065",
                          ifelse(dcFull$School=="Randle Highlands ES","$21,543,183",
                            ifelse(dcFull$School=="School Without Walls HS","$40,512,741",
                              ifelse(dcFull$School=="Sousa MS","$34,545,250",
                                ifelse(dcFull$School=="Barnard ES","$24,386,910", 
                                  ifelse(dcFull$School=="Kelly Miller MS","$34,578,507", 
                                    ifelse(dcFull$School=="McKinley MS","$15,000,000",
                                      ifelse(dcFull$School=="Savoy ES","$34,338,372",
                                        ifelse(dcFull$School=="Stoddert ES","$34,319,480",
                                          ifelse(dcFull$School=="Wilson HS","$135,126,577",
                                dcFull$MajorExp9815))))))))))))
dcFull$LifetimeBudget<-ifelse(dcFull$School=="Barnard ES","$24,386,910", 
                        ifelse(dcFull$School=="Kelly Miller MS","$34,578,507", 
                          ifelse(dcFull$School=="McKinley MS","$15,000,000",
                            ifelse(dcFull$School=="Savoy ES","$34,338,372",
                              ifelse(dcFull$School=="Stoddert ES","$34,319,480",
                                ifelse(dcFull$School=="Wilson HS","$135,126,577",
                                       dcFull$LifetimeBudget))))))

### Add in Future Spending for Charters ###
### Add in Future Spending for Charters ###
### Add in Future Spending for Charters ###
charterFuture$FY16<-numeric(charterFuture$FY2016.FA)
charterFuture$FY17<-numeric(charterFuture$FY2017.FA)
charterFuture$FY18<-numeric(charterFuture$FY2018.FA)
charterFuture$FY19<-numeric(charterFuture$FY2019.FA)
charterFuture$FY20<-numeric(charterFuture$FY2020.FA)
charterFuture$FY21<-numeric(charterFuture$FY2021.FA)
charterFuture$TotalAllotandPlan1621<-charterFuture$FY21 + charterFuture$FY20 + charterFuture$FY19 +
charterFuture$FY18 + charterFuture$FY17 + charterFuture$FY16

OpenFuture<-subset(charterFuture,charterFuture$TotalAllotandPlan1621!=0)
OpenFuture$SchoolName<-gsub("  "," ",OpenFuture$Master.PCS.List.1998.2014.15)
OpenFuture$SchoolName<-ifelse(OpenFuture$SchoolName=="AppleTree Douglass/Savannah Terr.","AppleTree Southeast",
                        ifelse(OpenFuture$SchoolName=="Capital City Upper School","Capital City High School",
                          ifelse(OpenFuture$SchoolName=="Cesar Chavez Bruce Prep","Cesar Chavez PCS Chavez Prep",
                            ifelse(OpenFuture$SchoolName=="DCI, District of Columbia International School","District of Columbia International School",
                             ifelse(OpenFuture$SchoolName=="E.L. Haynes Kansas Ave Elementary","E.L. Haynes PCS Kansas Avenue (Elementary School)",
                               ifelse(OpenFuture$SchoolName=="E.W. Stokes","Elsie Whitlow Stokes Community Freedom PCS",
                                 ifelse(OpenFuture$SchoolName=="Friendship Collegiate","Friendship Woodson Collegiate Academy",
                                   ifelse(OpenFuture$SchoolName=="Next Step","The Next Step",OpenFuture$SchoolName ))))))))

OpenFuture<-OpenFuture[order(OpenFuture$SchoolName),]
OpenFuture<-OpenFuture[c(14:15)]

charterFull<-subset(dcFull, dcFull$Agency=="PCS")[c(3)]
charter<-unique(charterFull)
charter$School2<-gsub("  "," ",charter$School)
charter<-charter[order(charter$School2),]

futureBind<-cbind(OpenFuture,charter)[c(1,3)]
colnames(futureBind)[c(2)]<-c("School")

charterJoin<-subset(dcFull, dcFull$Agency=="PCS")[-c(9)]
charterFull<-join(charterJoin,futureBind,by="School")

DCPS<-subset(dcFull, dcFull$Agency !="PCS")
dcFull<-rbind(DCPS,charterFull)
rm(DCPS,charterJoin,charterFull,charter,OpenFuture,charterFuture,futureBind,CharterDataSheet)

### Add in Closed Charter information and join with DC Full ###
### Add in Closed Charter information and join with DC Full ###
### Add in Closed Charter information and join with DC Full ###
closedCharter$MajorExp9815<-money(closedCharter$MajorExp9815)
closedCharter$ccSpend<-numeric(closedCharter$MajorExp9815)

dcFull$MajorExp9815<-money(dcFull$MajorExp9815)
dcFull$MajorExp9815<-numeric(dcFull$MajorExp9815)

#for charters that are have spending under (combined) need to be divided up to current holdings
# divided between holdings that were 'open' a year after the (combined) 'closed'
toDivide<-subset(closedCharter,is.na(closedCharter$Action))

toDivideAdd<-subset(toDivide,(grepl("SAIL|Washington Academy|Howard",toDivide$Master.PCS.List.1998.2014.15)))
toDivideAdd$PCSName
toDivideAdd$ccSpend/3

toDivideMerge<-subset(toDivide,(grepl("Next Step|Ideal|Option|E.L. Haynes|Maya",toDivide$Master.PCS.List.1998.2014.15)))
toDivideMerge$Address<-c("3600 Georgia Avenue, NW","5600 East Capitol Street NE",
                         "6130 N Capitol Street, NW","1375 E Street, NE","3047 15th Street NW")
  
toAdd<-subset(closedCharter,closedCharter$Action==1)[c(2:7,9:10,12)]
toAdd$MajorExp9815<-ifelse(grepl("Howard Road",toAdd$Master.PCS.List.1998.2014.15),toAdd$ccSpend+2945769,
                  ifelse(grepl("Washington Academy",toAdd$Master.PCS.List.1998.2014.15),toAdd$ccSpend+179450,
                    ifelse(grepl("SAIL",toAdd$Master.PCS.List.1998.2014.15),toAdd$ccSpend+927867,
                           toAdd$ccSpend)))
colnames(toAdd)[c(1)]<-"School"
toAdd<-toAdd[-c(9)]
toAdd$TotalAllotandPlan1621<-rep(0,47)
toAdd$LifetimeBudget<-toAdd$MajorExp9815
toAdd$Agency<-rep("PCS",47)
dcAlmost<-rbind.fill(dcFull,toAdd)

#spend for charters that are listed closed but open in different variation - add spend over
#Booker T Washington to be added as separate line (no currently open iterations) 
#and Maya Angelou added to Evans Campus only
toMerge<-subset(closedCharter,closedCharter$Action==2)
toMerge2<-rbind(toMerge,toDivideMerge)
toMerge2$Address<-ifelse(toMerge2$Master.PCS.List.1998.2014.15=="AppleTree Parkland",
                         "2011 Savannah Terrace, SE",toMerge2$Address)
ccToMerge<-aggregate(ccSpend ~ Address, toMerge2, sum)

ccToMerge$addressMatch<-addressClean(ccToMerge$Address)
dcAlmost2<-join(dcAlmost,ccToMerge,by="addressMatch",type="left")

ccToMergeOut<-subset(ccToMerge,!(ccToMerge$addressMatch %in% dcAlmost2$addressMatch))
dcAlmost2$ccSpend<-ifelse(dcAlmost2$School=="Maya Angelou Evans Campus PCS",4256639,dcAlmost2$ccSpend)
dcAlmost2$ccSpend[is.na(dcAlmost2$ccSpend)] <- 0
dcAlmost2$MajorExp9815<-dcAlmost2$MajorExp9815+dcAlmost2$ccSpend

ccToMergeOut<-ccToMergeOut[c(1),][-c(3)]
colnames(ccToMergeOut)[c(2)]<-"MajorExp9815"
ccToMergeOut$School<-"Booker T Washington"
ccToMergeOut$Ward<-1
ccToMergeOut$TotalAllotandPlan1621<-0
ccToMergeOut$LifetimeBudget<-ccToMergeOut$MajorExp9815
ccToMergeOut$Agency<-"PCS"
ccToMergeOut$YearsOpen<-12
ccToMergeOut$Open.Now<-0
dcAlmost2<-rbind.fill(dcAlmost2,ccToMergeOut)

#back toDivide
toDivide2<-subset(toDivide,!(grepl("Next Step|Ideal|Option|SAIL|Washington Academy|Howard|E.L. Haynes|Maya",
                                   toDivide$Master.PCS.List.1998.2014.15)))

toDivideFunc<-function(dcFullGrep,OpenYr,divideGrep) {
toAddTo<-subset(dcAlmost2,(grepl(dcFullGrep,dcAlmost2$School) & Open==OpenYr))
toDivideTo<-subset(toDivide2,grepl(divideGrep,toDivide2$Master.PCS.List.1998.2014.15))
sum<-sum(toAddTo$Total.Enrolled)
toAddTo$MajorExp9815<-toAddTo$MajorExp9815+(toDivideTo$ccSpend*(toAddTo$Total.Enrolled/sum))
toAddTo
}
AppleTree<-toDivideFunc("AppleTree Early Learning Center","2008","Apple Tree")
CapCity<-toDivideFunc("Capital City","2009","Capital City")
CesarChavez<-toDivideFunc("Cesar","2006","Cesar")
CommAcademy<-toDivideFunc("Community Academy","2006","Community Academy")
DCPrep<-toDivideFunc("D C  Preparatory","2008","DC Prep")
Eagle<-toDivideFunc("Eagle","2010","Eagle")
Friendship<-toDivideFunc("Friendship PCS","2003","Friendship")
Hope<-toDivideFunc("Hope Community","2008","Hope")
KIPP<-toDivideFunc("KIPP","2006","KIPP")
Latin<-toDivideFunc("Washington Latin","2009","Latin")

addBack<-rbind(AppleTree,CapCity,CesarChavez,CommAcademy,DCPrep,Eagle,Friendship,Hope,KIPP,Latin)
base<-subset(dcAlmost2,!(dcAlmost2$School %in% addBack$School))

dcFull<-rbind(base,addBack)

rm(addBack,AppleTree,base,CapCity,ccToMerge,ccToMergeOut,CesarChavez,closedCharter,CommAcademy,dcAlmost,dcAlmost2,
   DCPrep,Eagle,Friendship,Hope,KIPP,Latin,toAdd,toDivide,toDivide2,toDivideAdd,toDivideMerge,toMerge,toMerge2)

### split shared enrollment and $ by sq footage ###
### split shared enrollment and $ by sq footage ###
### split shared enrollment and $ by sq footage ###
dcFull$maxOccupancy<-numeric(dcFull$maxOccupancy)
dcFull$totalSQFT<-numeric(dcFull$totalSQFT)
codeDup<-subset(dcFull,(dcFull$School.ID %in% unique(School.ID[duplicated(School.ID)])) & 
                  !(is.na(dcFull$School.ID)) & dcFull$Agency=="PCS")
codeDup$School.ID[is.na(codeDup$School.ID)] <- 0
sqftSum<-aggregate(totalSQFT ~ School.ID, codeDup, sum)
colnames(sqftSum)<-c("School.ID","sumSQFT")

codeDup2<-join(codeDup,sqftSum, by="School.ID")
codeDup2$Total.Enrolled<-round((codeDup2$totalSQFT/codeDup2$sumSQFT)*codeDup2$Total.Enrolled)
codeDup2$MajorExp9815<-round((codeDup2$totalSQFT/codeDup2$sumSQFT)*codeDup2$MajorExp9815)
codeDup2$TotalAllotandPlan1621<-round((codeDup2$totalSQFT/codeDup2$sumSQFT)*codeDup2$TotalAllotandPlan1621)
codeDup2<-codeDup2[-c(38)]

codeNoDup<-subset(dcFull,!(dcFull$School.ID %in% codeDup2$School.ID))
dcFull<-rbind(codeNoDup,codeDup)

### update lat long and calculated fields to account for updated fields ###
### update lat long and calculated fields to account for updated fields ###
### update lat long and calculated fields to account for updated fields ###
dcFull$MajorExp9815[is.na(dcFull$MajorExp9815)] <- 0
dcFull<-dcFull[-c(11:13,33,38)]
attach(dcFull)

dcFull$AtRiskPer<-At_Risk/Total.Enrolled
dcFull$SpentPerMaxOccupancy<-MajorExp9815/maxOccupancy
dcFull$SpentPerSqFt<-MajorExp9815/totalSQFT

### Geocode for address fixes
noAddress<-subset(dcFull,is.na(dcFull$Address))
yesAddress<-subset(dcFull,!(is.na(dcFull$Address)))
yesAddress$FullAddress<-paste(yesAddress$Address, ",Washington,DC")
address<-yesAddress$FullAddress
latlong<-geocode(address, source="google")

ward=readOGR("https://raw.githubusercontent.com/benbalter/dc-maps/master/maps/ward-2012.geojson","OGRGeoJSON")

addAll<-SpatialPoints(latlong, proj4string=CRS(as.character("+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0")))
wardID <- over(addAll, ward )
ward<-wardID[c(2)]

noAddress$longitude<-rep(NA,4)
noAddress$latitude<-rep(NA,4)
noAddress$Ward<-rep(NA,4)

dcFull1<-cbind(yesAddress,latlong,ward)[-c(11,34)]
colnames(dcFull1)[c(33:35)]<-c("longitude","latitude","Ward")

dcFullNew<-rbind(dcFull1,noAddress)

### Add in missing LEP
updateLEP<-subset(dcFullNew,is.na(dcFullNew$Limited.English.Proficient) & !(is.na(dcFullNew$Total.Enrolled)))
updateLEP<-subset(updateLEP,updateLEP$School.ID!=292)[-c(13,15)]
enroll_LEP_miss<-enroll[c(2,20:24)]
fixedLEP<-join(updateLEP,enroll_LEP_miss,by="School.ID", type="left")
fixedLEP$SPED<-fixedLEP$Level.1+fixedLEP$Level.2+fixedLEP$Level.3+fixedLEP$Level.4
fixedLEP<-fixedLEP[-c(35:38)]
goodstartLEP<-subset(dcFullNew,!(dcFullNew$School.ID %in% fixedLEP$School.ID))
dcFullUpdated<-rbind(goodstartLEP,fixedLEP)
dcFullUpdated$ESLPer<-dcFullUpdated$Limited.English.Proficient/dcFullUpdated$Total.Enrolled
dcFullUpdated$SPEDPer<-dcFullUpdated$SPED/dcFullUpdated$Total.Enrolled
dcFullUpdated$LifetimeBudget<-money(dcFullUpdated$LifetimeBudget)
dcFullUpdated$LifetimeBudget<-numeric(dcFullUpdated$LifetimeBudget)
dcFullUpdated$TotalAllotandPlan1621<-money(dcFullUpdated$TotalAllotandPlan1621)
dcFullUpdated$TotalAllotandPlan1621<-numeric(dcFullUpdated$TotalAllotandPlan1621)
dcFullUpdated$LifetimeBudget<-ifelse(dcFullUpdated$Agency=="PCS",
                                     dcFullUpdated$MajorExp9815 + dcFullUpdated$TotalAllotandPlan1621,
                                     dcFullUpdated$LifetimeBudget)   

### Clean up school names
dcFullUpdated$School1<-gsub("PCS","",dcFullUpdated$School)
dcFullUpdated$School1<-gsub("EC","Education Campus",dcFullUpdated$School1)
dcFullUpdated$School1<-gsub("ES","Elementary",dcFullUpdated$School1)
dcFullUpdated$School1<-gsub("MS","Middle",dcFullUpdated$School1)
dcFullUpdated$School1<-gsub("HS","High",dcFullUpdated$School1)
dcFullUpdated$School1<-gsub("  "," ",dcFullUpdated$School1)
dcFullUpdated$School1<-gsub("D C ","DC ",dcFullUpdated$School1)
dcFullUpdated$School1<-gsub(" -|- ","-",dcFullUpdated$School1)
dcFullUpdated$School1<-ifelse(dcFullUpdated$School1=="Community Academy CA Online","Community Academy CAPCS Online",
                        ifelse(dcFullUpdated$School1=="Columbia Heights Education Campus (CHEducation Campus)","Columbia Heights Education Campus (CHEC)",
                          ifelse(dcFullUpdated$School1=="bowen","Bowen",
                            ifelse(dcFullUpdated$School1=="brucemonroe-demolished","Bruce Monroe ES (demolished)",
                              ifelse(dcFullUpdated$School1=="ferebeehope","Ferebee Hope",
                                ifelse(dcFullUpdated$School1=="garnettpatterson","Garnett Patterson",
                                  ifelse(dcFullUpdated$School1=="macfarland","Macfarland",
                                    ifelse(dcFullUpdated$School1=="Malcolmx","Malcolm X ES",
                                      ifelse(dcFullUpdated$School1=="marshall","Marshall",
                                        ifelse(dcFullUpdated$School1=="mcterrell","Mcterrell",
                                          ifelse(dcFullUpdated$School1=="mmwashingtion","MM Washington",
                                            ifelse(dcFullUpdated$School1=="montgomery/kipp","Montgomery/Kipp",
                                              ifelse(dcFullUpdated$School1=="prharris","PR Harris",
                                                ifelse(dcFullUpdated$School1=="rhterrell","RH Terrell",
                                                  ifelse(dcFullUpdated$School1=="ronbrown","Ron Brown",
                                                    ifelse(dcFullUpdated$School1=="rudolph","Rudolph",
                                                      ifelse(dcFullUpdated$School1=="shaw","Shaw",
                                                        ifelse(dcFullUpdated$School1=="wilkinson","Wilkinson",
                                                          ifelse(dcFullUpdated$School1=="School Without Walls @ Francis-Stevens Education Campus", "Francis Stevens",
                                                               dcFullUpdated$School1)))))))))))))))))))

colnames(dcFullUpdated)
dcFullUpdated<-dcFullUpdated[-c(3,22,23,25:28)]
colnames(dcFullUpdated)[c(29)]<-c("School")
options("scipen"=100, "digits"=4)
dcFullUpdated<-dcFullUpdated

### Remove dots in colnames
colnames(dcFullUpdated)[c(1,11:12,21)]<-c("School_ID","Total_Enrolled","Limited_English","Open_Now")

### All schools
write.csv(dcFullUpdated,
          "/Users/katerabinowitz/Documents/CodeforDC/school-modernization/Output Data/DCSchools_FY1415_Master_321.csv",
          row.names=FALSE)

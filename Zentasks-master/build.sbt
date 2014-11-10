name := "Zentasks"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  "mysql" % "mysql-connector-java" % "5.1.20",
  cache
)     

play.Project.playJavaSettings

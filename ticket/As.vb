Case 86 '"Training"
    'TfsID:5958;Vijeth;03/13/2014
    Dim showAssignedCourse As Boolean = False
    If (DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetNOPServiceStatus()) Then
        Dim subject As String = ""
        Dim body As String = ""

        Dim goLiveDateCheckbox As Boolean = False
        Dim ImpactedTaskCheckbox As Boolean = False
        Dim materialCourseCheckbox As Boolean = False
        coName = ""
        coIDValue = 0
        coValue = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetEmailEmployeeNotices(coName, coIDValue)
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & coValue & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        goLiveDateCheckbox = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetImpactedTaskAndGoLiveDateCheckboxStatus(True)
        ImpactedTaskCheckbox = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetImpactedTaskAndGoLiveDateCheckboxStatus(False)
        materialCourseCheckbox = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseMaterialServiceStatus()
        subject = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetSubject()
        body = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetBody()

        VsClasses.ExecuteSQL("EXEC sp_CreateOrUpdateNotificationForNop @CompanyID= " & Session("CompanyID") & " , @User='" & Session("UserLogin") & "' , @GoLiveDate=" & Convert.ToByte(goLiveDateCheckbox) & " , @ImpactedTask=" & Convert.ToByte(ImpactedTaskCheckbox) & " , @CourseMaterial=" & Convert.ToByte(materialCourseCheckbox) & ",@Subject='" & Replace(subject, "'", "''") & "', @Body='" & Replace(body, "'", "''") & "'")
    End If

    coName = ""
    coIDValue = 0
    showAssignedCourse = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).getParentTrainingConfigValue(coName, coIDValue)
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & coValue & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = ""
    coIDValue = 0
    coValue = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).getRecordImportConfigValue(coName, coIDValue)
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & coValue & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = ""
    coIDValue = 0
    coValue = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).getTrainingCurriculumValue(coName, coIDValue)
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & coValue & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = ""
    coIDValue = 0
    Dim showEnhancedTraining = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetEnhancedTrainingBlueprintSetting(coName, coIDValue) 'IADC - Configuration Options<<6512>> -A checked box saying - Enable Enhanced Training Blueprint Settings
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & showEnhancedTraining & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
    HttpContext.Current.Session("IsEnhancedTraining") = If(showEnhancedTraining = 0, False, True)

    coName = ""
    coIDValue = 0
    Dim EmailTrainingExpirationnotices = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetEmailtrainingexpirationnotices(coName, coIDValue) 'EmailTrainingExpirationnotices
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailTrainingExpirationnotices & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    Try
        coName = "" 'Assignments Email Reminder for revamp
        coIDValue = 0
        Dim AssignmentsEmailReminder As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAssignmentsEmailReminder(coName, coIDValue) 'AssignmentsEmailReminder
        'Dim AssignmentsEmailReminderDate = AssignmentsEmailReminder.Split("|")(0).ToString()
        'coIDValue = AssignmentsEmailReminder.Split("|")(1).ToString()
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & AssignmentsEmailReminder & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
    Catch ex As Exception
    End Try

    coName = "" 'Allow trainee to purchase the course
    coIDValue = 0
    Dim alloTraineeTopurchase As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAllowTraineeToPurchase(coName, coIDValue) 'Allow trainee to purchase the course
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & alloTraineeTopurchase & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = "" 'Due -In Filter to check the due in logic for fetching the records in SET
    coIDValue = 0
    Dim DueInFilter As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetDueInFilterConfiguration(coName, coIDValue) 'Allow trainee to purchase the course
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & DueInFilter & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = ""
    coIDValue = 0
    Dim IncludeDisclaimer As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetIncludeDisclaimerConfiguration(coName, coIDValue)
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & IncludeDisclaimer & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = "" 'Send auto email for Missed Questions in the exam
    coIDValue = 0
    Dim EmailStudyGuide As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailStudyGuide(coName, coIDValue) 'Send auto email for Missed Questions in the exam
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailStudyGuide & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = "" 'Send auto email for Failed Questions in the exam
    coIDValue = 0
    Dim EmailFailedExam As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailFailedExam(coName, coIDValue) ''Send auto email for Failed Questions in the exam
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailFailedExam & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = "" 'Send Auto-Generated Email to trainee after completion of job title requirements
    coIDValue = 0
    Dim EmailJobTitleComplete As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailJobTitleComplete(coName, coIDValue) ''Send auto email for Failed Questions in the exam
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailJobTitleComplete & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)


    coName = "" 'Send auto email consists of quarterly report
    coIDValue = 0
    Dim EmailQuarterlyReport As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailQuarterlyReport(coName, coIDValue) 'Send auto email consists of quarterly report
    If EmailQuarterlyReport = "1" Then
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailQuarterlyReport & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
        coName = ""
        coIDValue = 0
        Dim EmailQuarterly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailQuarterly(coName, coIDValue) 'Send auto email consists of quarterly report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailQuarterly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = ""
        coIDValue = 0
        Dim EmailMonthly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailMonthly(coName, coIDValue) 'Send auto email consists of quarterly report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailMonthly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = ""
        coIDValue = 0
        Dim EmailWeekly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailWeekly(coName, coIDValue) 'Send auto email consists of quarterly report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailWeekly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        If EmailQuarterlyReport = "1" And EmailQuarterly = "0" And EmailMonthly = "0" And EmailWeekly = "0" Then
            EmailQuarterly = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailQuarterly(coName, coIDValue) 'Send auto email consists of Course Code report
            VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & "1" & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
        End If
    Else
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailQuarterlyReport & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
        coName = ""
        coIDValue = 0
        Dim EmailQuarterly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailQuarterly(coName, coIDValue) 'Send auto email consists of quarterly report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='0', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = ""
        coIDValue = 0
        Dim EmailMonthly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailMonthly(coName, coIDValue) 'Send auto email consists of quarterly report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='0', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = ""
        coIDValue = 0
        Dim EmailWeekly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailWeekly(coName, coIDValue) 'Send auto email consists of quarterly report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='0', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
    End If
    coName = "" 'Send auto email consists of Course Code report
    coIDValue = 0
    Dim EmailCourseCodeReport As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetEmailCourseCodeReport(coName, coIDValue) 'Send auto email consists of Course Code report
    If EmailCourseCodeReport = "1" Then
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailCourseCodeReport & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
        coName = "" 'Send auto email consists of Course Code report
        coIDValue = 0
        Dim CourseCodeReportDaily As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportDaily(coName, coIDValue) 'Send auto email consists of Course Code report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & CourseCodeReportDaily & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = "" 'Send auto email consists of Course Code report
        coIDValue = 0
        Dim CourseCodeReportWeekly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportWeekly(coName, coIDValue) 'Send auto email consists of Course Code report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & CourseCodeReportWeekly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = "" 'Send auto email consists of Course Code report
        coIDValue = 0
        Dim CourseCodeReportMonthly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportMonthly(coName, coIDValue) 'Send auto email consists of Course Code report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & CourseCodeReportMonthly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        If EmailCourseCodeReport = "1" And CourseCodeReportDaily = "0" And CourseCodeReportWeekly = "0" And CourseCodeReportMonthly = "0" Then
            CourseCodeReportMonthly = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportMonthly(coName, coIDValue) 'Send auto email consists of Course Code report
            VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & "1" & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
        End If
    Else
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailCourseCodeReport & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
        coName = "" 'Send auto email consists of Course Code report
        coIDValue = 0
        Dim CourseCodeReportDaily As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportDaily(coName, coIDValue) 'Send auto email consists of Course Code report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & CourseCodeReportDaily & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = "" 'Send auto email consists of Course Code report
        coIDValue = 0
        Dim CourseCodeReportWeekly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportWeekly(coName, coIDValue) 'Send auto email consists of Course Code report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & CourseCodeReportWeekly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

        coName = "" 'Send auto email consists of Course Code report
        coIDValue = 0
        Dim CourseCodeReportMonthly As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetCourseCodeReportMonthly(coName, coIDValue) 'Send auto email consists of Course Code report
        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & CourseCodeReportMonthly & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
    End If

    coName = "" 'Make the 'Manage Course Exemptions' Page Available to This User
    coIDValue = 0
    Dim ShowExemptMenu As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetShowExemptMenuOption(coName, coIDValue) 'Make the 'Manage Course Exemptions' Page Available to This User
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & ShowExemptMenu & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)

    coName = "" 'Make the 'Manage Course Exemptions' Page Available to This User
    coIDValue = 0
    Dim ShowExamFailure As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetTrainingExamFailureValue(coName, coIDValue) 'Make the 'Manage Course Exemptions' Page Available to This User
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & ShowExamFailure & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)



    coName = "" 'Make the 'Manage Course Exemptions' Page Available to This User
    coIDValue = 0
    Dim SendExemptNotification As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetSendExemptNotificationOption(coName, coIDValue) 'Send Notifications for Course Exemptions
    VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & SendExemptNotification & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)




                            coIDValue = 0
                        Dim EmailJobTitleComplete As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailJobTitleComplete(coName, coIDValue) ''Send auto email for Failed Questions in the exam
                        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & EmailJobTitleComplete & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)


                        coName = "" 'Send Auto-Generated Email to trainee after completion of job title requirements
                        coIDValue = 0
                        Dim onlyassing As String = DirectCast(usTrainingRecordImport, TrainingRecordImportConfig).GetConfigurationAutoEmailJobTitleComplete(coName, coIDValue) ''Send auto email for Failed Questions in the exam
                        VsClasses.ExecuteSQL("EXEC sp_AddModifyCompanyOption @COID= " & coIDValue & " , @CompID=" & Session("CompanyID") & ",@COValue='" & chkOnlyAssigned & "', @Editor='" & Session("UserLogin") & "'" & ", @ShowOnlyAssignedCourses= " & showAssignedCourse)
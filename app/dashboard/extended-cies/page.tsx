import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CieMarksTable from './cie-marks-table'

async function ExtendedCies() {
    const supabase = await createClient()
    
    const { data: cieMarks, error } = await supabase
        .from('cie_marks')
        .select('*');

    if (error) {
        console.error('Error fetching CIE marks:', error)
        return (
            <div className="m-4 mt-3">
                <Card className="h-screen">
                    <CardHeader>
                        <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
                            Extended CIE-Marks Table
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">Error loading data. Please try again later.</p>
                    </CardContent>
                </Card>
            </div>
        )
    } 

    return (
        <div className="m-4 mt-3">
            <Card className="h-screen">
                <CardHeader>
                    <CardTitle className="text-[#1A5CA1] font-manrope font-bold text-[25px] leading-[25px]">
                        Extended CIE-Marks Table
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CieMarksTable data={cieMarks || []} />
                </CardContent>
            </Card>
        </div>
    )
}

export default ExtendedCies